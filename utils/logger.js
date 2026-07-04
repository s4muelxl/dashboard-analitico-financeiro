const db = require('../config/db');

/**
 * Registra uma ação na tabela admin_logs
 * @param {number|null} operatorId ID do usuário que fez a ação (ex: admin)
 * @param {number|null} userId ID do usuário afetado pela ação
 * @param {string} acao Tipo de ação (login, logout, cadastro, alteracao, exclusao, bloqueio, etc.)
 * @param {string} detalhes Detalhes textuais da operação
 */
async function logAction(operatorId, userId, acao, detalhes) {
  try {
    await db.query(
      'INSERT INTO admin_logs (operator_id, user_id, acao, detalhes) VALUES (?, ?, ?, ?)',
      [operatorId, userId, acao, detalhes]
    );
  } catch (error) {
    console.error('Erro ao gravar log no banco:', error.message);
  }
}

module.exports = {
  logAction
};
