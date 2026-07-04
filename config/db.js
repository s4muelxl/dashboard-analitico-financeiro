const { Pool } = require('pg');
require('dotenv').config();

let pool;

try {
  const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'strong_finance',
        port: parseInt(process.env.DB_PORT || '5432')
      };

  pool = new Pool(connectionConfig);

  // Testar conexão
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('Conexão com o banco de dados PostgreSQL (Supabase) estabelecida com sucesso!');
    })
    .catch(err => {
      console.error('Erro ao conectar ao banco de dados PostgreSQL:', err.message);
      console.log('Certifique-se de configurar a variável DATABASE_URL no arquivo .env.');
    });
} catch (error) {
  console.error('Falha ao inicializar o pool do banco de dados:', error);
}

module.exports = {
  query: async (sql, params = []) => {
    try {
      let translatedSql = sql;
      let paramIndex = 1;

      // 1. Traduzir marcadores "?" para "$1", "$2" etc.
      while (translatedSql.includes('?')) {
        translatedSql = translatedSql.replace('?', `$${paramIndex}`);
        paramIndex++;
      }

      // 2. Traduzir funções específicas do MySQL para PostgreSQL
      translatedSql = translatedSql
        .replace(/YEAR\(data\)/gi, "EXTRACT(YEAR FROM data)")
        .replace(/MONTH\(data\)/gi, "EXTRACT(MONTH FROM data)")
        .replace(/DATE_SUB\(CURDATE\(\), INTERVAL 3 MONTH\)/gi, "data >= NOW() - INTERVAL '3 months'")
        .replace(/CURDATE\(\)/gi, 'CURRENT_DATE')
        .replace(/ON DUPLICATE KEY UPDATE/gi, 'ON CONFLICT (user_id, tipo, data) DO UPDATE SET');

      // 3. Traduzir INSERT para retornar o ID inserido
      const isInsert = translatedSql.trim().toUpperCase().startsWith('INSERT');
      if (isInsert && !translatedSql.toUpperCase().includes('RETURNING')) {
        translatedSql += ' RETURNING id';
      }

      const res = await pool.query(translatedSql, params);

      // 4. Emular o comportamento de retorno do driver MySQL para compatibilidade nas rotas
      if (isInsert && res.rows && res.rows[0]) {
        return {
          insertId: res.rows[0].id,
          affectedRows: res.rowCount,
          rows: res.rows
        };
      }

      // Para consultas normais, retorna diretamente a lista de registros
      return res.rows;
    } catch (error) {
      console.error('Erro na consulta SQL (Postgres):', sql, '\nErro:', error);
      throw error;
    }
  },
  pool
};
