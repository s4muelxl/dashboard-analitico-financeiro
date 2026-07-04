-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  cargo VARCHAR(20) DEFAULT 'comum',
  status VARCHAR(20) DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP NULL
);

-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  data DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de metas diárias de hábitos/finanças
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  meta_valor DECIMAL(10,2) NOT NULL,
  progresso_valor DECIMAL(10,2) DEFAULT 0.00,
  data DATE NOT NULL,
  CONSTRAINT unique_user_goal_date UNIQUE (user_id, tipo, data)
);

-- Criar tabela de rotina semanal
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  horario TIME NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  prioridade VARCHAR(20) DEFAULT 'media',
  status VARCHAR(20) DEFAULT 'pendente',
  tempo_estimado INT NOT NULL,
  recorrente BOOLEAN DEFAULT FALSE,
  dia_semana VARCHAR(20) DEFAULT 'diario'
);

-- Criar tabela de controle de acessos (sessões)
CREATE TABLE IF NOT EXISTS access_log (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL
);

-- Criar tabela de logs de auditoria administrativa
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  operator_id INT REFERENCES users(id) ON DELETE SET NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  acao VARCHAR(50) NOT NULL,
  detalhes TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário Admin inicial (senha: Admin@123456)
-- Hash gerado com bcrypt (10 rounds): $2a$10$U8TqLz9x6BvWfPjH3gO/Z.WjW7q9.X50nI5W9v88Qc/z4Jj8YlAFe
INSERT INTO users (nome, email, senha_hash, cargo, status) 
VALUES ('Administrador', 'admin@strongfinance.com', '$2a$10$U8TqLz9x6BvWfPjH3gO/Z.WjW7q9.X50nI5W9v88Qc/z4Jj8YlAFe', 'admin', 'ativo')
ON CONFLICT (email) DO NOTHING;
