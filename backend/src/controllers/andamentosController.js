const pool = require("../config/db");

// GET /api/andamentos?processo_id=X
exports.listarAndamentos = async (req, res, next) => {
  try {
    const { processo_id } = req.query;
    if (!processo_id)
      return res
        .status(400)
        .json({ error: 'Parâmetro "processo_id" é obrigatório.' });

    const [rows] = await pool.query(
      "SELECT * FROM andamentos WHERE processo_id = ? ORDER BY data_andamento DESC, id DESC",
      [processo_id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/andamentos/:id
exports.buscarAndamento = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM andamentos WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ error: "Andamento não encontrado." });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/andamentos
exports.criarAndamento = async (req, res, next) => {
  try {
    const { processo_id, data_andamento, descricao, tipo } = req.body;
    if (!processo_id)
      return res
        .status(404)
        .json({ error: 'Campo "processo_id" é obrigatório.' });
    if (!data_andamento)
      return res
        .status(400)
        .json({ error: 'Campo "data_andamento" é obrigatório.' });
    if (!descricao)
      return res
        .status(400)
        .json({ error: 'Campo "descrição" é obrigatório.' });

    const [processoCheck] = await pool.query(
      "SELECT id FROM processos WHERE id = ?",
      [processo_id],
    );
    if (!processoCheck.length)
      return res.status(400).json({ error: "Processo não encontrado." });

    const [result] = await pool.query(
      "INSERT INTO andamentos (processo_id, data_andamento, descricao, tipo) VALUES (?, ?, ?, ?)",
      [processo_id, data_andamento, descricao, tipo || null],
    );
    const [rows] = await pool.query("SELECT * FROM andamentos WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/andamentos/:id
exports.atualizarAndamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data_andamento, descricao, tipo } = req.body;

    const [existing] = await pool.query("SELECT id FROM andamentos WHERE id = ?", [
      id,
    ]);
    if (!existing.length)
      return res.status(404).json({ error: "Andamento não encontrado." });

    await pool.query(
      "UPDATE andamentos SET data_andamento = ?, descricao = ?, tipo = ? WHERE id = ?",
      [data_andamento, descricao, tipo || null, id],
    );

    const [rows] = await pool.query("SELECT * FROM andamentos WHERE id = ?", [
      id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/andamentos/:id
exports.deletarAndamento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query(
      "SELECT id FROM andamentos WHERE id = ?",
      [id],
    );
    if (!existing.length)
      return res.status(404).json({ error: "Andamento não encontrado." });

    await pool.query("DELETE FROM andamentos WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
