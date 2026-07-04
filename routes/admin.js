const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// Todas as rotas admin requerem autenticação e cargo de administrador
router.use(authenticateToken, isAdmin);

// Estatísticas do Painel Admin
router.get('/stats', async (req, res) => {
  try {
    // Total de usuários
    const totalUsersRes = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Usuários online (login sem logout nas últimas 4 horas)
    const onlineUsersRes = await db.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM access_log WHERE logout_time IS NULL AND login_time >= DATE_SUB(NOW(), INTERVAL 4 HOUR)'
    );

    // Novos cadastros nos últimos 30 dias
    const newRegistersRes = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE data_criacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // Total movimentado na plataforma (soma de receitas + despesas)
    const totalVolumeRes = await db.query('SELECT SUM(valor) as sum FROM transactions');

    // Últimos acessos
    const lastAccesses = await db.query(
      `SELECT a.id, a.ip_address, a.user_agent, a.login_time, u.nome, u.email 
       FROM access_log a 
       JOIN users u ON a.user_id = u.id 
       ORDER BY a.login_time DESC LIMIT 10`
    );

    res.json({
      totalUsers: totalUsersRes[0].count,
      onlineUsers: onlineUsersRes[0].count,
      newRegisters: newRegistersRes[0].count,
      totalVolume: parseFloat(totalVolumeRes[0].sum || 0),
      lastAccesses
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas admin:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do painel.' });
  }
});

// Listar todos os usuários
router.get('/users', async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, nome, email, cargo, status, data_criacao, ultimo_acesso FROM users ORDER BY nome ASC'
    );
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Criar usuário (Admin criando)
router.post('/users', async (req, res) => {
  const { nome, email, password, cargo } = req.body;

  if (!nome || !email || !password || !cargo) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (nome, email, senha_hash, cargo, status) VALUES (?, ?, ?, ?, "ativo")',
      [nome, email, hash, cargo]
    );

    await logAction(req.user.id, result.insertId, 'cadastro', `Admin criou usuário: ${email} (${cargo})`);
    
    res.status(201).json({
      id: result.insertId,
      nome,
      email,
      cargo,
      status: 'ativo'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// Editar usuário
router.put('/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { nome, email, cargo, status } = req.body;

  if (!nome || !email || !cargo || !status) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const check = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    await db.query(
      'UPDATE users SET nome = ?, email = ?, cargo = ?, status = ? WHERE id = ?',
      [nome, email, cargo, status, userId]
    );

    await logAction(req.user.id, userId, 'alteracao', `Admin alterou dados do usuário ID ${userId}. Status: ${status}, Cargo: ${cargo}`);
    
    res.json({ id: userId, nome, email, cargo, status });
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    res.status(500).json({ error: 'Erro ao editar usuário.' });
  }
});

// Bloquear / Desbloquear usuário
router.patch('/users/:id/toggle-block', async (req, res) => {
  const userId = req.params.id;

  try {
    const check = await db.query('SELECT status, email FROM users WHERE id = ?', [userId]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Impedir que o admin bloqueie a si mesmo
    if (parseInt(userId) === parseInt(req.user.id)) {
      return res.status(400).json({ error: 'Você não pode bloquear a si mesmo.' });
    }

    const newStatus = check[0].status === 'ativo' ? 'bloqueado' : 'ativo';

    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);
    await logAction(req.user.id, userId, 'bloqueio', `Admin alterou status do usuário ${check[0].email} para ${newStatus}`);

    res.json({ id: userId, status: newStatus });
  } catch (error) {
    console.error('Erro ao alterar status de bloqueio:', error);
    res.status(500).json({ error: 'Erro ao alterar status.' });
  }
});

// Resetar senha do usuário
router.post('/users/:id/reset-password', async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    const check = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET senha_hash = ? WHERE id = ?', [hash, userId]);
    await logAction(req.user.id, userId, 'alteracao', `Admin resetou a senha do usuário ${check[0].email}`);

    res.json({ message: 'Senha resetada com sucesso.' });
  } catch (error) {
    console.error('Erro ao resetar senha do usuário:', error);
    res.status(500).json({ error: 'Erro ao resetar senha.' });
  }
});

// Excluir usuário
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const check = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Impedir que o admin exclua a si mesmo
    if (parseInt(userId) === parseInt(req.user.id)) {
      return res.status(400).json({ error: 'Você não pode excluir a si mesmo.' });
    }

    const email = check[0].email;
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    await logAction(req.user.id, null, 'exclusao', `Admin excluiu permanentemente o usuário ${email}`);

    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

// Ver histórico de acessos de um usuário específico
router.get('/users/:id/access', async (req, res) => {
  const userId = req.params.id;

  try {
    const logs = await db.query(
      'SELECT ip_address, user_agent, login_time, logout_time FROM access_log WHERE user_id = ? ORDER BY login_time DESC LIMIT 100',
      [userId]
    );
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar histórico de acesso:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de acesso.' });
  }
});

// Obter logs administrativos gerais
router.get('/logs', async (req, res) => {
  try {
    const logs = await db.query(
      `SELECT l.id, l.acao, l.detalhes, l.timestamp,
              u1.nome as operador_nome, u1.email as operador_email,
              u2.nome as usuario_nome, u2.email as usuario_email
       FROM admin_logs l
       LEFT JOIN users u1 ON l.operator_id = u1.id
       LEFT JOIN users u2 ON l.user_id = u2.id
       ORDER BY l.timestamp DESC LIMIT 200`
    );
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs administrativos:', error);
    res.status(500).json({ error: 'Erro ao buscar logs.' });
  }
});

module.exports = router;
