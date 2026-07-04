const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../routes/auth');
const transactionRoutes = require('../routes/transactions');
const goalRoutes = require('../routes/goals');
const taskRoutes = require('../routes/tasks');
const reportRoutes = require('../routes/reports');
const adminRoutes = require('../routes/admin');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

module.exports = app;
