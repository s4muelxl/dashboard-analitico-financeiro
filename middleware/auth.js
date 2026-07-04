const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'strong_finance_super_secret_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.cargo === 'admin') {
    next();
  } else {
    res.status(43).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};
