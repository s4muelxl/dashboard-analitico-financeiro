const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logAction } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'strong_finance_super_secret_key_2026';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Cadastro de usuário
router.post('/register', async (req, res) => {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    // Verificar se o e-mail já existe
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(password, salt);

    // Se for o primeiro usuário, define como admin, senhas posteriores são comuns
    const countResult = await db.query('SELECT COUNT(*) as total FROM users');
    const cargo = countResult[0].total === 0 ? 'admin' : 'comum';

    // Inserir no banco
    const result = await db.query(
      'INSERT INTO users (nome, email, senha_hash, cargo, status) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, cargo, 'ativo']
    );
    const userId = result.insertId;

    // Gerar token JWT
    const token = jwt.sign({ id: userId, email, cargo }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Criar metas diárias padrão para o novo usuário na data atual
    const today = new Date().toISOString().split('T')[0];
    const defaultGoals = [
      { tipo: 'agua', meta: 2000 },
      { tipo: 'estudos', meta: 120 },
      { tipo: 'exercicios', meta: 30 },
      { tipo: 'horas_trabalhadas', meta: 480 },
      { tipo: 'economia_dia', meta: 20 }
    ];
    for (const dg of defaultGoals) {
      await db.query(
        'INSERT IGNORE INTO goals (user_id, tipo, meta_valor, progresso_valor, data) VALUES (?, ?, ?, 0.00, ?)',
        [userId, dg.tipo, dg.meta, today]
      );
    }

    // Logar ação
    await logAction(null, userId, 'cadastro', `Usuário cadastrado com sucesso. Cargo: ${cargo}`);

    // Logar acesso
    const ip = req.ip || req.headers['x-forwarded-for'];
    const ua = req.headers['user-agent'];
    await db.query(
      'INSERT INTO access_log (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [userId, ip, ua]
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso.',
      token,
      user: { id: userId, nome, email, cargo }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  try {
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      await logAction(null, null, 'tentativa_falha', `Tentativa de login falhou. E-mail inexistente: ${email}`);
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const user = users[0];

    if (user.status === 'bloqueado') {
      await logAction(user.id, user.id, 'tentativa_falha', `Tentativa de login bloqueada. Usuário inativo.`);
      return res.status(403).json({ error: 'Esta conta foi bloqueada pelo administrador.' });
    }

    const validPassword = await bcrypt.compare(password, user.senha_hash);
    if (!validPassword) {
      await logAction(null, user.id, 'tentativa_falha', `Tentativa de login com senha incorreta para e-mail: ${email}`);
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Atualizar último acesso
    await db.query('UPDATE users SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Gerar token JWT
    const token = jwt.sign({ id: user.id, email: user.email, cargo: user.cargo }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

    // Registrar no access_log
    const ip = req.ip || req.headers['x-forwarded-for'];
    const ua = req.headers['user-agent'];
    await db.query(
      'INSERT INTO access_log (user_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [user.id, ip, ua]
    );

    // Logar ação
    await logAction(user.id, user.id, 'login', `Usuário realizou login com sucesso.`);

    res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Atualizar o último registro de access_log sem logout_time definido
    await db.query(
      'UPDATE access_log SET logout_time = CURRENT_TIMESTAMP WHERE user_id = ? AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1',
      [req.user.id]
    );

    await logAction(req.user.id, req.user.id, 'logout', `Usuário efetuou logout.`);

    res.json({ message: 'Logout efetuado com sucesso.' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro ao registrar logout.' });
  }
});

// Recuperação de senha - Solicitação
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Preencha o e-mail.' });
  }

  try {
    const users = await db.query('SELECT id, nome FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Por segurança, retorna a mesma mensagem para evitar enumeração de usuários
      return res.json({ message: 'Se o e-mail estiver cadastrado, uma chave de recuperação foi enviada.' });
    }

    // Criar um token de recuperação mockado baseado em timestamp e id
    const mockToken = Buffer.from(JSON.stringify({ id: users[0].id, expires: Date.now() + 3600000 })).toString('base64');

    await logAction(users[0].id, users[0].id, 'alteracao', `Solicitação de recuperação de senha.`);

    res.json({
      message: 'Se o e-mail estiver cadastrado, uma chave de recuperação foi enviada.',
      debug_token: mockToken // Facilitando o teste local
    });
  } catch (error) {
    console.error('Erro na solicitação de recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Recuperação de senha - Resetar
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Dados insuficientes.' });
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    
    if (Date.now() > decoded.expires) {
      return res.status(400).json({ error: 'Código de recuperação expirado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET senha_hash = ? WHERE id = ?', [senhaHash, decoded.id]);
    await logAction(decoded.id, decoded.id, 'alteracao', `Senha redefinida via recuperação de senha.`);

    res.json({ message: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  } catch (error) {
    console.error('Erro no reset da senha:', error);
    res.status(400).json({ error: 'Código de recuperação inválido.' });
  }
});

// Pegar dados do próprio usuário
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await db.query('SELECT id, nome, email, cargo, status, data_criacao, ultimo_acesso FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil.' });
  }
});

module.exports = router;
