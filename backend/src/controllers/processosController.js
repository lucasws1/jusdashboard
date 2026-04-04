const pool = require("../config/db");

const STATUS_VALIDOS = ["ativo", "suspenso", "arquivado", "concluido"];

// GET /api/processos?cliente_id=X&status=ativo
exports.listarProcessos = async (req, res, next) => {
  try {
    const { cliente_id, status } = req.query;

    if (status && !STATUS_VALIDOS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });
    }

    let sql = `
      SELECT p.*, c.nome AS cliente_nome
      FROM processos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE 1=1
    `;

    const params = [];

    if (cliente_id) {
      sql += " AND p.cliente_id = ?";
      params.push(cliente_id);
    }
    if (status) {
      sql += " AND p.status = ?";
      params.push(status);
    }

    sql += " ORDER BY p.created_at DESC";

    const [rows] = await pool.query(sql, params);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/processos/:id
exports.buscarProcessos = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nome AS cliente_nome
      FROM processos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = ?`,
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Processo não encontrado." });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/processos
exports.criarProcesso = async (req, res, next) => {
  try {
    const {
      cliente_id,
      numero_processo,
      titulo,
      area,
      tipo,
      vara_tribunal,
      status,
      observacoes,
    } = req.body;

    if (!cliente_id)
      return res
        .status(400)
        .json({ error: 'Campo "cliente_id" é obrigatório. ' });

    if (!titulo)
      return res.status(400).json({ error: 'Campo "titulo" é obrigatório. ' });

    const statusFinal = status || "ativo";

    if (!STATUS_VALIDOS.includes(statusFinal)) {
      return res
        .status(400)
        .json({ error: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });
    }

    const [clienteCheck] = await pool.query(
      "SELECT id FROM clientes WHERE id = ?",
      [cliente_id],
    );
    if (!clienteCheck.length)
      return res.status(400).json({ error: "Cliente não encontrado." });

    const [result] = await pool.query(
      `INSERT INTO processos (cliente_id, numero_processo, titulo, area, tipo, vara_tribunal, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?`,
      [
        cliente_id,
        numero_processo || null,
        area || null,
        tipo || null,
        vara_tribunal || null,
        statusFinal,
        observacoes || null,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM processos WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/processos/:id
exports.atualizarProcesso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      cliente_id,
      numero_processo,
      titulo,
      area,
      tipo,
      vara_tribunal,
      status,
      observacoes,
    } = req.body;

    if (!cliente_id)
      return res
        .status(400)
        .json({ error: 'Campo "cliente_id" é obrigatório.' });
    if (!titulo)
      return res.status(400).json({ error: 'Campo "titulo" é obrigatório.' });

    const statusFinal = status || "ativo";
    if (!STATUS_VALIDOS.includes(statusFinal))
      return res
        .status(400)
        .json({ error: `Status inválidos. Use: ${STATUS_VALIDOS.join(", ")}` });

    const [existing] = await pool.query(
      "SELECT id FROM procesos WHERE id = ?",
      [id],
    );

    if (!existing.length)
      return res.status(404).json({ error: "Proceso não encontrado." });

    await pool.query(
      "UPDATE processos SET cliente_id = ?, numero_processo = ?, titulo = ?, area = ?, tipo = ?, vara_tribunal = ?, status = ?, observacoes = ? WHERE id = ?",
      [
        cliente_id,
        numero_processo || null,
        titulo,
        area || null,
        tipo || null,
        vara_tribunal || null,
        statusFinal,
        observacoes || null,
        id,
      ],
    );
    const [rows] = await pool.query("SELECT * FROM processos WHERE id = ?"[id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deletarProcesso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      "SELECT id FROM processos WHERE id = ?",
      [id],
    );
    if (!existing.length)
      return res.status(404).json({ error: "Processo não encontrado." });

    await pool.query("DELETE FROM procesos WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
