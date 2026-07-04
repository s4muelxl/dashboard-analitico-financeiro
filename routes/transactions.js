const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// Middleware para verificar token em todas as rotas de transações
router.use(authenticateToken);

// Listar transações com filtros
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { search, period, category, type, sortBy } = req.query;

  let query = 'SELECT id, user_id, descricao, descricao AS description, categoria, categoria AS category, valor, valor AS amount, tipo, tipo AS type, data, data AS date, observacao FROM transactions WHERE user_id = ?';
  const params = [userId];

  // Filtro de Busca (Descrição)
  if (search && search.trim() !== '') {
    query += ' AND descricao LIKE ?';
    params.push(`%${search.trim()}%`);
  }

  // Filtro de Categoria
  if (category && category !== 'all') {
    query += ' AND categoria = ?';
    params.push(category);
  }

  // Filtro de Tipo (Receita/Despesa)
  if (type && type !== 'all') {
    query += ' AND tipo = ?';
    params.push(type);
  }

  // Filtro de Período
  if (period && period !== 'all') {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

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

  // Ordenação
  let orderStr = ' ORDER BY data DESC';
  if (sortBy) {
    if (sortBy === 'date-asc') orderStr = ' ORDER BY data ASC';
    else if (sortBy === 'amount-desc') orderStr = ' ORDER BY valor DESC';
    else if (sortBy === 'amount-asc') orderStr = ' ORDER BY valor ASC';
  }
  query += orderStr;

  try {
    const transactions = await db.query(query, params);
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações.' });
  }
});

// Detalhes de uma transação específica
router.get('/:id', async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  try {
    const results = await db.query('SELECT id, user_id, descricao, descricao AS description, categoria, categoria AS category, valor, valor AS amount, tipo, tipo AS type, data, data AS date, observacao FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ error: 'Erro ao buscar transação.' });
  }
});

// Criar transação
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { descricao, categoria, valor, tipo, data, observacao } = req.body;

  if (!descricao || !categoria || !valor || !tipo || !data) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO transactions (user_id, descricao, categoria, valor, tipo, data, observacao) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, descricao, categoria, valor, tipo, data, observacao || null]
    );

    const newTxId = result.insertId;
    await logAction(userId, userId, 'alteracao', `Criou transação ID ${newTxId}: ${tipo === 'income' ? '+' : '-'} R$${valor} (${descricao})`);

    res.status(201).json({
      id: newTxId,
      user_id: userId,
      descricao,
      description: descricao,
      categoria,
      category: categoria,
      valor,
      amount: valor,
      tipo,
      type: tipo,
      data,
      date: data,
      observacao
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação.' });
  }
});

// Atualizar transação
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;
  const { descricao, categoria, valor, tipo, data, observacao } = req.body;

  if (!descricao || !categoria || !valor || !tipo || !data) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
  }

  try {
    // Verificar se pertence ao usuário
    const checkTx = await db.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
    if (checkTx.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    await db.query(
      'UPDATE transactions SET descricao = ?, categoria = ?, valor = ?, tipo = ?, data = ?, observacao = ? WHERE id = ? AND user_id = ?',
      [descricao, categoria, valor, tipo, data, observacao || null, transactionId, userId]
    );

    await logAction(userId, userId, 'alteracao', `Atualizou transação ID ${transactionId}: ${tipo === 'income' ? '+' : '-'} R$${valor} (${descricao})`);

    res.json({
      id: transactionId,
      descricao,
      description: descricao,
      categoria,
      category: categoria,
      valor,
      amount: valor,
      tipo,
      type: tipo,
      data,
      date: data,
      observacao
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação.' });
  }
});

// Deletar transação
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const transactionId = req.params.id;

  try {
    // Verificar se pertence ao usuário e pegar dados para o log
    const checkTx = await db.query('SELECT descricao, valor, tipo FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
    if (checkTx.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada.' });
    }

    const tx = checkTx[0];

    await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
    await logAction(userId, userId, 'exclusao', `Excluiu transação ID ${transactionId}: ${tx.tipo === 'income' ? '+' : '-'} R$${tx.valor} (${tx.descricao})`);

    res.json({ message: 'Transação excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({ error: 'Erro ao excluir transação.' });
  }
});

module.exports = router;
