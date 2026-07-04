const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

router.use(authenticateToken);

// Helper para buscar transações filtradas para o relatório
async function getReportData(userId, period, type, category) {
  let query = 'SELECT id, user_id, descricao, descricao AS description, categoria, categoria AS category, valor, valor AS amount, tipo, tipo AS type, data, data AS date, observacao FROM transactions WHERE user_id = ?';
  const params = [userId];

  if (category && category !== 'all') {
    query += ' AND categoria = ?';
    params.push(category);
  }

  if (type && type !== 'all') {
    query += ' AND tipo = ?';
    params.push(type);
  }

  if (period && period !== 'all') {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (period === 'current-month') {
      query += ' AND YEAR(data) = ? AND MONTH(data) = ?';
      params.push(currentYear, currentMonth + 1);
    } else if (period === 'last-month') {
      const lm = currentMonth === 0 ? 12 : currentMonth;
      const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
      query += ' AND YEAR(data) = ? AND MONTH(data) = ?';
      params.push(ly, lm);
    } else if (period === 'last-3-months') {
      query += ' AND data >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
    } else if (period === 'current-year') {
      query += ' AND YEAR(data) = ?';
      params.push(currentYear);
    }
  }

  query += ' ORDER BY data DESC';
  return await db.query(query, params);
}

// Exportar CSV
router.get('/csv', async (req, res) => {
  const userId = req.user.id;
  const { period, type, category } = req.query;

  try {
    const transactions = await getReportData(userId, period, type, category);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_financeiro_${period || 'all'}.csv`);

    // BOM para o Excel abrir corretamente em UTF-8
    let csvContent = '\uFEFF';
    csvContent += 'Data;Descrição;Tipo;Categoria;Valor (R$);Observações\n';

    transactions.forEach(t => {
      const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');
      const tipo = t.tipo === 'income' ? 'Receita' : 'Despesa';
      const valor = t.valor.toString().replace('.', ',');
      const obs = t.observacao ? t.observacao.replace(/[\n\r;]/g, ' ') : '';
      
      csvContent += `"${dataFormatada}";"${t.descricao}";"${tipo}";"${t.categoria}";"${valor}";"${obs}"\n`;
    });

    res.send(csvContent);
  } catch (error) {
    console.error('Erro ao gerar CSV:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório CSV.' });
  }
});

// Exportar Excel
router.get('/excel', async (req, res) => {
  const userId = req.user.id;
  const { period, type, category } = req.query;

  try {
    const transactions = await getReportData(userId, period, type, category);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transações');

    worksheet.columns = [
      { header: 'Data', key: 'data', width: 15 },
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Valor (R$)', key: 'valor', width: 18 },
      { header: 'Observação', key: 'observacao', width: 35 }
    ];

    // Estilo do Cabeçalho
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Cor do header (#1e293b)
    };

    let totalReceitas = 0;
    let totalDespesas = 0;

    transactions.forEach(t => {
      const valorNum = parseFloat(t.valor);
      const isIncome = t.type === 'income';

      if (isIncome) totalReceitas += valorNum;
      else totalDespesas += valorNum;

      const row = worksheet.addRow({
        data: new Date(t.data).toLocaleDateString('pt-BR'),
        descricao: t.descricao,
        tipo: isIncome ? 'Receita' : 'Despesa',
        categoria: t.categoria,
        valor: valorNum,
        observacao: t.observacao || ''
      });

      // Alinhamento e formato de moeda
      row.getCell('valor').numFmt = '"R$" #,##0.00;[Red]"R$" -#,##0.00';
      row.getCell('tipo').font = { color: { argb: isIncome ? 'FF10B981' : 'FFEF4444' }, bold: true };
    });

    // Adicionar linha vazia e totais
    worksheet.addRow([]);
    const totalRow = worksheet.addRow({
      descricao: 'Resumo do Relatório',
      categoria: 'Receita Total:',
      valor: totalReceitas
    });
    totalRow.font = { bold: true };
    totalRow.getCell('valor').numFmt = '"R$" #,##0.00';
    totalRow.getCell('categoria').alignment = { horizontal: 'right' };

    const totalExpenseRow = worksheet.addRow({
      categoria: 'Despesa Total:',
      valor: totalDespesas
    });
    totalExpenseRow.font = { bold: true };
    totalExpenseRow.getCell('valor').numFmt = '"R$" #,##0.00';
    totalExpenseRow.getCell('categoria').alignment = { horizontal: 'right' };

    const balanceRow = worksheet.addRow({
      categoria: 'Saldo Líquido:',
      valor: totalReceitas - totalDespesas
    });
    balanceRow.font = { bold: true, color: { argb: (totalReceitas - totalDespesas) >= 0 ? 'FF10B981' : 'FFEF4444' } };
    balanceRow.getCell('valor').numFmt = '"R$" #,##0.00';
    balanceRow.getCell('categoria').alignment = { horizontal: 'right' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_financeiro_${period || 'all'}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório Excel.' });
  }
});

// Exportar PDF
router.get('/pdf', async (req, res) => {
  const userId = req.user.id;
  const { period, type, category } = req.query;

  try {
    const transactions = await getReportData(userId, period, type, category);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_financeiro_${period || 'all'}.pdf`);

    doc.pipe(res);

    // Título / Cabeçalho do PDF
    doc.fillColor('#1e293b').fontSize(22).text('Strong Finance Dashboard', { align: 'center', bold: true });
    doc.fontSize(12).fillColor('#64748b').text('Relatório Analítico de Movimentações Financeiras', { align: 'center' });
    doc.moveDown(1.5);

    // Metadados do relatório
    const dateFormatted = new Date().toLocaleString('pt-BR');
    doc.fillColor('#334155').fontSize(10)
       .text(`Gerado em: ${dateFormatted}`)
       .text(`Filtro de Período: ${period === 'current-month' ? 'Mês Atual' : period === 'last-month' ? 'Mês Anterior' : period === 'last-3-months' ? 'Últimos 3 Meses' : period === 'current-year' ? 'Ano Atual' : 'Todos'}`)
       .text(`Usuário: ${req.user.email}`);
    
    doc.moveDown(2);

    // Resumo de Valores
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += parseFloat(t.valor);
      else totalExpense += parseFloat(t.valor);
    });
    const balance = totalIncome - totalExpense;

    doc.rect(50, doc.y, 495, 60).fill('#f8fafc');
    doc.fillColor('#0f172a');
    
    const startY = doc.y + 15;
    doc.fontSize(10).text('Receitas Totais', 70, startY);
    doc.fontSize(12).fillColor('#10b981').text(`R$ ${totalIncome.toFixed(2).replace('.', ',')}`, 70, startY + 15);

    doc.fillColor('#0f172a');
    doc.fontSize(10).text('Despesas Totais', 220, startY);
    doc.fontSize(12).fillColor('#ef4444').text(`R$ ${totalExpense.toFixed(2).replace('.', ',')}`, 220, startY + 15);

    doc.fillColor('#0f172a');
    doc.fontSize(10).text('Saldo Atual', 370, startY);
    doc.fontSize(12).fillColor(balance >= 0 ? '#10b981' : '#ef4444').text(`R$ ${balance.toFixed(2).replace('.', ',')}`, 370, startY + 15);

    doc.moveDown(4.5);

    // Tabela de Transações
    doc.fillColor('#1e293b').fontSize(12).text('Transações Detalhadas', { bold: true });
    doc.moveDown(0.5);

    // Cabeçalho da Tabela
    const tableHeaderY = doc.y;
    doc.fontSize(9).fillColor('#ffffff');
    doc.rect(50, tableHeaderY, 495, 20).fill('#1e293b');
    
    doc.text('Data', 60, tableHeaderY + 5);
    doc.text('Descrição', 130, tableHeaderY + 5);
    doc.text('Categoria', 260, tableHeaderY + 5);
    doc.text('Tipo', 370, tableHeaderY + 5);
    doc.text('Valor', 460, tableHeaderY + 5, { width: 70, align: 'right' });

    let currentY = tableHeaderY + 20;

    // Linhas
    transactions.forEach((t, i) => {
      // Evitar quebrar página no meio de uma linha
      if (currentY > 730) {
        doc.addPage();
        currentY = 50;
        
        // Repetir cabeçalho na nova página
        doc.fontSize(9).fillColor('#ffffff');
        doc.rect(50, currentY, 495, 20).fill('#1e293b');
        doc.text('Data', 60, currentY + 5);
        doc.text('Descrição', 130, currentY + 5);
        doc.text('Categoria', 260, currentY + 5);
        doc.text('Tipo', 370, currentY + 5);
        doc.text('Valor', 460, currentY + 5, { width: 70, align: 'right' });
        currentY += 20;
      }

      // Cor de fundo alternada
      if (i % 2 === 0) {
        doc.rect(50, currentY, 495, 20).fill('#f8fafc');
      }

      doc.fontSize(8).fillColor('#334155');
      const dataStr = new Date(t.data).toLocaleDateString('pt-BR');
      doc.text(dataStr, 60, currentY + 6);
      doc.text(t.descricao, 130, currentY + 6, { width: 120, height: 10, ellipsis: true });
      doc.text(t.categoria, 260, currentY + 6, { width: 100, height: 10, ellipsis: true });
      
      const isIncome = t.type === 'income';
      doc.fillColor(isIncome ? '#10b981' : '#ef4444');
      doc.text(isIncome ? 'Receita' : 'Despesa', 370, currentY + 6);
      
      const valStr = `R$ ${parseFloat(t.valor).toFixed(2).replace('.', ',')}`;
      doc.text(valStr, 460, currentY + 6, { width: 70, align: 'right' });

      currentY += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório PDF.' });
  }
});

module.exports = router;
