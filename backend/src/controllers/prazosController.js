const pool = require("../config/db");

const STATUS_VALIDOS = ["pendente", "concluido", "cancelado"];

const TIPOS_VALIDOS = [
  "audiência",
  "recurso",
  "contrarrazões",
  "laudo pericial",
  "manifestação",
  "contestação",
  "embargos",
  "petição",
  "outros",
];

const formatarData = (data) => {
  if (!data) return null;
  return new Date(data).toISOString().split("T")[0];
};

// GET /api/prazos?processo_id=X&status=pendente&tipo=audiência&busca=texto&data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD
exports.listarPrazos = async (req, res, next) => {
  try {
    const { processo_id, status, tipo, busca, data_inicio, data_fim } =
      req.query;

    if (status && !STATUS_VALIDOS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (data_inicio && !dateRegex.test(data_inicio)) {
      return res
        .status(400)
        .json({ error: 'Formato de "data_inicio" inválido. Use YYYY-MM-DD.' });
    }
    if (data_fim && !dateRegex.test(data_fim)) {
      return res
        .status(400)
        .json({ error: 'Formato de "data_fim" inválido. Use YYYY-MM-DD.' });
    }

    let sql = `
      SELECT pr.*, p.titulo AS processo_titulo, c.nome AS cliente_nome
      FROM prazos pr
      JOIN processos p ON p.id = pr.processo_id
      JOIN clientes c ON c.id = p.cliente_id
      WHERE 1=1
    `;

    const params = [];

    if (processo_id) {
      sql += " AND pr.processo_id = ?";
      params.push(processo_id);
    }

    if (status) {
      sql += " AND pr.status = ?";
      params.push(status);
    }

    if (tipo) {
      sql += " AND pr.tipo = ?";
      params.push(tipo);
    }

    if (busca) {
      sql += " AND pr.descricao LIKE ?";
      params.push(`%${busca}%`);
    }

    if (data_inicio) {
      sql += " AND pr.data_prazo >= ?";
      params.push(data_inicio);
    }

    if (data_fim) {
      sql += " AND pr.data_prazo <= ?";
      params.push(data_fim);
    }

    sql += " ORDER BY pr.data_prazo ASC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/prazos/proximos?dias=30
exports.proximos = async (req, res, next) => {
  try {
    const dias = Number(req.query.dias) || 30;
    if (isNaN(dias) || dias < 1 || dias > 365) {
      return res
        .status(400)
        .json({ error: 'Parâmetro "dias" deve ser um número entre 1 e 365' });
    }

    const [rows] = await pool.query(
      `SELECT pr.*, p.titulo AS processo_titulo, c.nome AS cliente_nome
        FROM prazos pr 
        JOIN processos p ON p.id = pr.processo_id 
        JOIN clientes c ON c.id = p.cliente_id 
        WHERE pr.status= 'pendente' 
        AND pr.data_prazo BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY) 
        ORDER BY pr.data_prazo ASC`,
      [dias],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/prazos/:id
exports.buscarPrazo = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM prazos WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ error: "Prazo não encontrado." });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/prazos
exports.criarPrazo = async (req, res, next) => {
  try {
    const { processo_id, descricao, tipo, data_prazo, status, observacoes } =
      req.body;

    if (!processo_id)
      return res
        .status(400)
        .json({ error: 'Campo "processo_id" é obrigatório.' });
    if (!descricao)
      return res
        .status(400)
        .json({ error: 'Campo "descrição" é obrigatório.' });
    if (!data_prazo)
      return res
        .status(400)
        .json({ error: 'Campo "data_prazo" é obrigatório.' });

    const statusFinal = status || "pendente";
    if (!STATUS_VALIDOS.includes(statusFinal)) {
      return res
        .status(400)
        .json({ error: `Status inválidos. Use: ${STATUS_VALIDOS.join(", ")}` });
    }

    const [processoCheck] = await pool.query(
      "SELECT id FROM processos WHERE id = ?",
      [processo_id],
    );

    if (!processoCheck.length)
      return res.status(400).json({ error: "Processo não encontrado." });

    const [result] = await pool.query(
      "INSERT INTO prazos (processo_id, descricao, tipo, data_prazo, status, observacoes) VALUES (?, ?, ?, ?, ?)",
      [
        processo_id,
        descricao,
        tipo,
        formatarData(data_prazo),
        statusFinal,
        observacoes || null,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM prazos WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/prazos/:id
exports.atualizarPrazo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { descricao, tipo, data_prazo, status, observacoes } = req.body;

    if (!descricao)
      return res
        .status(400)
        .json({ error: 'Campo "descricao" é obrigatório. ' });
    if (!data_prazo)
      return res
        .status(400)
        .json({ error: 'Campo "data_prazo" é obrigatório.' });

    const statusFinal = status || "pendente";
    if (!STATUS_VALIDOS.includes(statusFinal))
      return res
        .status(400)
        .json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });

    const [existing] = await pool.query("SELECT id FROM prazos WHERE id = ?", [
      id,
    ]);
    if (!existing.length)
      return res.status(404).json({ error: "Prazo não encontrado." });

    await pool.query(
      "UPDATE prazos SET descricao = ?, tipo = ?, data_prazo = ?, status = ?, observacoes = ? WHERE id = ?",
      [
        descricao,
        tipo || null,
        formatarData(data_prazo),
        statusFinal,
        observacoes || null,
        id,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM prazos WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/prazos/:id
exports.deletarPrazo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query("SELECT id FROM prazos WHERE id = ?", [
      id,
    ]);
    if (!existing.length)
      return res.status(404).json({ error: "Prazo não encontrado." });

    await pool.query("DELETE FROM prazos WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
