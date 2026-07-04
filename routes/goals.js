const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Middleware para verificar token
router.use(authenticateToken);

// Buscar metas de um dia específico (Default: Hoje)
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const date = req.query.date || new Date().toISOString().split('T')[0];

  try {
    let goals = await db.query('SELECT * FROM goals WHERE user_id = ? AND data = ?', [userId, date]);

    // Se não houver metas para esse dia, inicializa as metas padrão a partir do último registro ou cria novas zeradas
    if (goals.length === 0) {
      // Tentar copiar os valores das metas mais recentes do usuário
      const latestGoals = await db.query(
        'SELECT tipo, meta_valor FROM goals WHERE user_id = ? ORDER BY data DESC LIMIT 10',
        [userId]
      );

      const targetGoals = [
        { tipo: 'agua', meta: 2000 },
        { tipo: 'estudos', meta: 120 },
        { tipo: 'exercicios', meta: 30 },
        { tipo: 'horas_trabalhadas', meta: 480 },
        { tipo: 'economia_dia', meta: 20 }
      ];

      // Atualizar valores de meta se encontrar registros antigos
      if (latestGoals.length > 0) {
        targetGoals.forEach(tg => {
          const found = latestGoals.find(lg => lg.tipo === tg.tipo);
          if (found) tg.meta = parseFloat(found.meta_valor);
        });
      }

      // Inserir metas padrão para o dia solicitado
      for (const tg of targetGoals) {
        await db.query(
          'INSERT IGNORE INTO goals (user_id, tipo, meta_valor, progresso_valor, data) VALUES (?, ?, ?, 0.00, ?)',
          [userId, tg.tipo, tg.meta, date]
        );
      }

      // Buscar novamente
      goals = await db.query('SELECT * FROM goals WHERE user_id = ? AND data = ?', [userId, date]);
    }

    res.json(goals);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas.' });
  }
});

// Atualizar progresso ou meta de um objetivo
router.post('/update', async (req, res) => {
  const userId = req.user.id;
  const { tipo, progresso_valor, meta_valor, date } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  if (!tipo) {
    return res.status(400).json({ error: 'Tipo de meta não especificado.' });
  }

  try {
    // Verificar se já existe a meta para o dia
    const existing = await db.query(
      'SELECT id, meta_valor, progresso_valor FROM goals WHERE user_id = ? AND tipo = ? AND data = ?',
      [userId, tipo, targetDate]
    );

    if (existing.length > 0) {
      // Atualizar
      const newProgress = progresso_valor !== undefined ? parseFloat(progresso_valor) : parseFloat(existing[0].progresso_valor);
      const newMeta = meta_valor !== undefined ? parseFloat(meta_valor) : parseFloat(existing[0].meta_valor);

      await db.query(
        'UPDATE goals SET progresso_valor = ?, meta_valor = ? WHERE user_id = ? AND tipo = ? AND data = ?',
        [newProgress, newMeta, userId, tipo, targetDate]
      );
    } else {
      // Inserir nova
      const newProgress = progresso_valor !== undefined ? parseFloat(progresso_valor) : 0.00;
      const newMeta = meta_valor !== undefined ? parseFloat(meta_valor) : 100.00; // valor padrão genérico

      await db.query(
        'INSERT INTO goals (user_id, tipo, meta_valor, progresso_valor, data) VALUES (?, ?, ?, ?, ?)',
        [userId, tipo, newMeta, newProgress, targetDate]
      );
    }

    res.json({ message: 'Meta atualizada com sucesso.', tipo, targetDate });
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ error: 'Erro ao atualizar meta.' });
  }
});

module.exports = router;
