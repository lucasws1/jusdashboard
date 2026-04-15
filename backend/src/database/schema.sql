-- ============================================================
-- JusDashboard - Gestão Completa para Advogados — Schema v1
-- ============================================================
CREATE DATABASE IF NOT EXISTS jusdashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jusdashboard;
-- ------------------------------------------------------------
-- CLIENTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  observacoes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- PROCESSOS
-- Área: ex. 'cível', 'trabalhista', 'criminal', 'previdenciário'
-- Tipo: ex. 'ação ordinária', 'execução', 'agravo'
-- Status: 'ativo' | 'suspenso' | 'arquivado' | 'encerrado'
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  numero_processo VARCHAR(50),
  -- ex: 5001234-12.2024.4.04.7100
  titulo VARCHAR(255) NOT NULL,
  area VARCHAR(100),
  tipo VARCHAR(100),
  vara_tribunal VARCHAR(255),
  status ENUM('ativo', 'suspenso', 'arquivado', 'encerrado') NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_processo_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
-- ------------------------------------------------------------
-- ANDAMENTOS
-- Registro cronológico de movimentações do processo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS andamentos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  processo_id INT UNSIGNED NOT NULL,
  data_andamento DATE NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(100),
  -- ex: 'despacho', 'audiência', 'sentença', 'petição'
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_andamento_processo FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- ------------------------------------------------------------
-- PRAZOS
-- Status: 'pendente' | 'concluido' | 'cancelado'
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prazos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  processo_id INT UNSIGNED NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  data_prazo DATE NOT NULL,
  status ENUM('pendente', 'concluido', 'cancelado') NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prazo_processo FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE ON UPDATE CASCADE
);
-- ------------------------------------------------------------
-- LANCAMENTOS FINANCEIROS
-- Honorários, custas, depósitos e reembolsos vinculados ao processo
-- data_pagamento NULL = pendente; preenchido = pago
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  processo_id     INT UNSIGNED NOT NULL,
  tipo            ENUM('honorario', 'custa', 'deposito', 'reembolso', 'outro') NOT NULL,
  descricao       VARCHAR(255) NOT NULL,
  valor           DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NULL,
  data_pagamento  DATE NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lancamento_processo
    FOREIGN KEY (processo_id) REFERENCES processos(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
-- ------------------------------------------------------------
-- Índices adicionais (FKs já criam índice em cliente_id e processo_id)
-- Apenas índices que agregam valor extra são criados aqui
-- ------------------------------------------------------------
CREATE INDEX idx_processos_status ON processos (status);
CREATE INDEX idx_andamentos_data ON andamentos (data_andamento);
CREATE INDEX idx_prazos_data_status ON prazos (data_prazo, status);
CREATE INDEX idx_lancamentos_processo ON lancamentos_financeiros (processo_id);
CREATE INDEX idx_lancamentos_pagamento ON lancamentos_financeiros (data_pagamento);