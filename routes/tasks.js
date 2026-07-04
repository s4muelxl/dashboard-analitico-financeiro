const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Listar todas as tarefas (com filtro opcional por dia da semana)
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { dia_semana } = req.query;

  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [userId];

  if (dia_semana) {
    query += ' AND (dia_semana = ? OR dia_semana = "diario")';
    params.push(dia_semana);
  }

  // Ordenar por horário
  query += ' ORDER BY horario ASC';

  try {
    const tasks = await db.query(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
});

// Criar tarefa
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { descricao, horario, categoria, prioridade, tempo_estimado, recorrente, dia_semana } = req.body;

  if (!descricao || !horario || !categoria || !tempo_estimado || !dia_semana) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO tasks (user_id, descricao, horario, categoria, prioridade, tempo_estimado, recorrente, dia_semana, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pendente")',
      [userId, descricao, horario, categoria, prioridade || 'media', parseInt(tempo_estimado), recorrente ? 1 : 0, dia_semana]
    );

    res.status(201).json({
      id: result.insertId,
      descricao,
      horario,
      categoria,
      prioridade,
      tempo_estimado,
      recorrente,
      dia_semana,
      status: 'pendente'
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
});

// Atualizar tarefa (conteúdo ou status)
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { descricao, horario, categoria, prioridade, tempo_estimado, recorrente, dia_semana, status } = req.body;

  try {
    // Verificar propriedade
    const checkTask = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (checkTask.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const t = checkTask[0];
    const updateDesc = descricao !== undefined ? descricao : t.descricao;
    const updateHorario = horario !== undefined ? horario : t.horario;
    const updateCat = categoria !== undefined ? categoria : t.categoria;
    const updatePrio = prioridade !== undefined ? prioridade : t.prioridade;
    const updateTempo = tempo_estimado !== undefined ? parseInt(tempo_estimado) : t.tempo_estimado;
    const updateRecorrente = recorrente !== undefined ? (recorrente ? 1 : 0) : t.recorrente;
    const updateDia = dia_semana !== undefined ? dia_semana : t.dia_semana;
    const updateStatus = status !== undefined ? status : t.status;

    await db.query(
      'UPDATE tasks SET descricao = ?, horario = ?, categoria = ?, prioridade = ?, tempo_estimado = ?, recorrente = ?, dia_semana = ?, status = ? WHERE id = ? AND user_id = ?',
      [updateDesc, updateHorario, updateCat, updatePrio, updateTempo, updateRecorrente, updateDia, updateStatus, taskId, userId]
    );

    res.json({
      id: taskId,
      descricao: updateDesc,
      horario: updateHorario,
      categoria: updateCat,
      prioridade: updatePrio,
      tempo_estimado: updateTempo,
      recorrente: updateRecorrente === 1,
      dia_semana: updateDia,
      status: updateStatus
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
});

// Toggle Status (Concluir / Desmarcar)
router.patch('/:id/toggle', async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    const checkTask = await db.query('SELECT status FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (checkTask.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const newStatus = checkTask[0].status === 'pendente' ? 'concluida' : 'pendente';

    await db.query('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?', [newStatus, taskId, userId]);
    res.json({ id: taskId, status: newStatus });
  } catch (error) {
    console.error('Erro ao alternar status da tarefa:', error);
    res.status(500).json({ error: 'Erro ao alternar status.' });
  }
});

// Preencher tarefas padrões
router.post('/populate-defaults', async (req, res) => {
  const userId = req.user.id;

  const defaultTasks = [
    { descricao: 'Café da manhã', horario: '07:30:00', categoria: 'Alimentação', prioridade: 'media', tempo: 30, dia: 'diario' },
    { descricao: 'Estudos', horario: '08:30:00', categoria: 'Desenvolvimento', prioridade: 'alta', tempo: 120, dia: 'diario' },
    { descricao: 'Trabalho / Projetos', horario: '13:00:00', categoria: 'Trabalho', prioridade: 'alta', tempo: 240, dia: 'diario' },
    { descricao: 'Academia', horario: '18:00:00', categoria: 'Saúde', prioridade: 'media', tempo: 90, dia: 'diario' },
    { descricao: 'Leitura', horario: '21:00:00', categoria: 'Estudos', prioridade: 'baixa', tempo: 30, dia: 'diario' },
    { descricao: 'Desenvolvimento pessoal', horario: '21:30:00', categoria: 'Desenvolvimento', prioridade: 'media', tempo: 45, dia: 'diario' }
  ];

  try {
    // Excluir tarefas padrão duplicadas para evitar poluição antes de criar
    for (const dt of defaultTasks) {
      const existing = await db.query(
        'SELECT id FROM tasks WHERE user_id = ? AND descricao = ? AND dia_semana = ?',
        [userId, dt.descricao, dt.dia]
      );
      if (existing.length === 0) {
        await db.query(
          'INSERT INTO tasks (user_id, descricao, horario, categoria, prioridade, tempo_estimado, recorrente, dia_semana, status) VALUES (?, ?, ?, ?, ?, ?, 1, ?, "pendente")',
          [userId, dt.descricao, dt.horario, dt.categoria, dt.prioridade, dt.tempo, dt.dia]
        );
      }
    }

    res.json({ message: 'Rotinas padrão criadas com sucesso.' });
  } catch (error) {
    console.error('Erro ao popular rotina padrão:', error);
    res.status(500).json({ error: 'Erro ao popular rotina padrão.' });
  }
});

// Excluir tarefa
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    const checkTask = await db.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (checkTask.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    res.json({ message: 'Tarefa excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
});

module.exports = router;
