-- Criar Banco de Dados
CREATE DATABASE IF NOT EXISTS strong_finance;
USE strong_finance;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  cargo ENUM('admin', 'comum') DEFAULT 'comum',
  status ENUM('ativo', 'bloqueado') DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  tipo ENUM('income', 'expense') NOT NULL,
  data DATE NOT NULL,
  observacao TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Metas Diárias
CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tipo ENUM('agua', 'estudos', 'exercicios', 'horas_trabalhadas', 'economia_dia') NOT NULL,
  meta_valor DECIMAL(10,2) NOT NULL,
  progresso_valor DECIMAL(10,2) DEFAULT 0.00,
  data DATE NOT NULL,
  UNIQUE KEY unique_user_goal_date (user_id, tipo, data),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Tarefas / Organizador de Rotina
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  horario TIME NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  prioridade ENUM('baixa', 'media', 'alta') DEFAULT 'media',
  status ENUM('pendente', 'concluida') DEFAULT 'pendente',
  tempo_estimado INT NOT NULL, -- em minutos
  recorrente BOOLEAN DEFAULT FALSE,
  dia_semana ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo', 'diario') DEFAULT 'diario',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Histórico de Acessos
CREATE TABLE IF NOT EXISTS access_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Logs Administrativos e Gerais
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operator_id INT NULL,
  user_id INT NULL,
  acao VARCHAR(50) NOT NULL, -- 'login', 'logout', 'cadastro', 'exclusao', 'alteracao', 'bloqueio', 'tentativa_falha'
  detalhes TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuário Admin inicial (senha: Admin@123456)
-- Hash gerado com bcrypt (10 rounds): $2a$10$U8TqLz9x6BvWfPjH3gO/Z.WjW7q9.X50nI5W9v88Qc/z4Jj8YlAFe
-- Por motivos de segurança, no primeiro acesso o admin pode alterar ou usar essa padrão criada no script de inicialização do backend.
INSERT INTO users (nome, email, senha_hash, cargo, status) 
VALUES ('Administrador', 'admin@strongfinance.com', '$2a$10$U8TqLz9x6BvWfPjH3gO/Z.WjW7q9.X50nI5W9v88Qc/z4Jj8YlAFe', 'admin', 'ativo')
ON DUPLICATE KEY UPDATE id=id;
