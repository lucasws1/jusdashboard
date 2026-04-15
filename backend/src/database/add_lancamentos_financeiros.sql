CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  processo_id     INT UNSIGNED NOT NULL,
  tipo            ENUM('honorario', 'custa', 'deposito', 'reembolso', 'outro') NOT NULL,
  descricao       VARCHAR(255) NOT NULL,
  valor           DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NULL,
  data_pagamento  DATE NULL,        -- NULL = pendente
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lancamento_processo
    FOREIGN KEY (processo_id) REFERENCES processos(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_lancamentos_processo ON lancamentos_financeiros (processo_id);
CREATE INDEX idx_lancamentos_pagamento ON lancamentos_financeiros (data_pagamento);
