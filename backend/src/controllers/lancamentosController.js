const pool = require("../config/db");

const TIPOS_VALIDOS = ["honorario", "custa", "deposito", "reembolso", "outro"];

const formatarData = (data) => {
  if (!data) return null;
  return new Date(data).toISOString().split("T")[0];
};

// GET /api/lancamentos?processo_id=X&tipo=honorario
exports.listarLancamentos = async (req, res, next) => {
  try {
    const { processo_id, tipo } = req.query;

    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      return res
        .status(400)
        .json({ error: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(", ")}` });
    }

    let sql = `
      SELECT lf.*, p.titulo AS processo_titulo, c.nome AS cliente_nome
      FROM lancamentos_financeiros lf
      JOIN processos p ON p.id = lf.processo_id
      JOIN clientes c ON c.id = p.cliente_id
      WHERE 1=1
    `;
    const params = [];

    if (processo_id) {
      sql += " AND lf.processo_id = ?";
      params.push(processo_id);
    }

    if (tipo) {
      sql += " AND lf.tipo = ?";
      params.push(tipo);
    }

    sql += " ORDER BY lf.created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/lancamentos/:id
exports.buscarLancamento = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM lancamentos_financeiros WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ error: "Lançamento não encontrado." });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/lancamentos
exports.criarLancamento = async (req, res, next) => {
  try {
    const {
      processo_id,
      tipo,
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
    } = req.body;

    if (!processo_id)
      return res
        .status(400)
        .json({ error: 'Campo "processo_id" é obrigatório.' });
    if (!tipo)
      return res.status(400).json({ error: 'Campo "tipo" é obrigatório.' });
    if (!TIPOS_VALIDOS.includes(tipo))
      return res
        .status(400)
        .json({ error: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(", ")}` });
    if (!descricao)
      return res
        .status(400)
        .json({ error: 'Campo "descricao" é obrigatório.' });
    if (valor === undefined || valor === null || valor === "")
      return res.status(400).json({ error: 'Campo "valor" é obrigatório.' });
    if (isNaN(Number(valor)) || Number(valor) < 0)
      return res
        .status(400)
        .json({ error: '"valor" deve ser um número positivo.' });

    const [processoCheck] = await pool.query(
      "SELECT id FROM processos WHERE id = ?",
      [processo_id],
    );
    if (!processoCheck.length)
      return res.status(400).json({ error: "Processo não encontrado." });

    const [result] = await pool.query(
      `INSERT INTO lancamentos_financeiros
        (processo_id, tipo, descricao, valor, data_vencimento, data_pagamento)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        processo_id,
        tipo,
        descricao,
        Number(valor),
        formatarData(data_vencimento),
        formatarData(data_pagamento),
      ],
    );

    const [rows] = await pool.query(
      "SELECT * FROM lancamentos_financeiros WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/lancamentos/:id
exports.atualizarLancamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, descricao, valor, data_vencimento, data_pagamento } =
      req.body;

    if (!tipo)
      return res.status(400).json({ error: 'Campo "tipo" é obrigatório.' });
    if (!TIPOS_VALIDOS.includes(tipo))
      return res
        .status(400)
        .json({ error: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(", ")}` });
    if (!descricao)
      return res
        .status(400)
        .json({ error: 'Campo "descricao" é obrigatório.' });
    if (valor === undefined || valor === null || valor === "")
      return res.status(400).json({ error: 'Campo "valor" é obrigatório.' });
    if (isNaN(Number(valor)) || Number(valor) < 0)
      return res
        .status(400)
        .json({ error: '"valor" deve ser um número positivo.' });

    const [existing] = await pool.query(
      "SELECT id FROM lancamentos_financeiros WHERE id = ?",
      [id],
    );
    if (!existing.length)
      return res.status(404).json({ error: "Lançamento não encontrado." });

    await pool.query(
      `UPDATE lancamentos_financeiros
       SET tipo = ?, descricao = ?, valor = ?, data_vencimento = ?, data_pagamento = ?
       WHERE id = ?`,
      [
        tipo,
        descricao,
        Number(valor),
        formatarData(data_vencimento),
        formatarData(data_pagamento),
        id,
      ],
    );

    const [rows] = await pool.query(
      "SELECT * FROM lancamentos_financeiros WHERE id = ?",
      [id],
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/lancamentos/:id
exports.deletarLancamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      "SELECT id FROM lancamentos_financeiros WHERE id = ?",
      [id],
    );
    if (!existing.length)
      return res.status(404).json({ error: "Lançamento não encontrado." });

    await pool.query("DELETE FROM lancamentos_financeiros WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
