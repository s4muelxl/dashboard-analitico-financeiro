const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const goalRoutes = require('./routes/goals');
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

const fs = require('fs');

// Servir arquivos estáticos do React se compilados
const reactBuildPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(reactBuildPath)) {
  app.use(express.static(reactBuildPath));
} else {
  // Fallback para o antigo Frontend em HTML/JS seletivamente
  app.use('/css', express.static(path.join(__dirname, 'css')));
  app.use('/js', express.static(path.join(__dirname, 'js')));

  app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
  });

  app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
  });

  app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// Middleware de tratamento de erro 404
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Endpoint não encontrado.' });
  } else {
    const reactIndex = path.join(reactBuildPath, 'index.html');
    if (fs.existsSync(reactIndex)) {
      res.sendFile(reactIndex);
    } else {
      res.status(404).sendFile(path.join(__dirname, 'login.html'));
    }
  }
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`   Strong Finance Dashboard rodando na porta ${PORT}`);
    console.log(`   Acesse: http://localhost:${PORT}`);
    console.log(`========================================================`);
  });
}

module.exports = app;
