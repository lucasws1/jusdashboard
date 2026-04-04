const pool = require("../config/db");

// GET /api/clientes
exports.listarClientes = async (req, res, next) => {
  try {
    const { busca } = req.query;
    let sql = "SELECT * FROM clientes";
    const params = [];

    if (busca) {
      sql += " WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?";
      const like = `%${busca}%`;
      params.push(like, like, like);
    }

    sql += " ORDER BY nome ASC";
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/clientes/:id
exports.buscarCliente = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [
      req.params.id,
    ]);

    if (!rows.length)
      return res.status(404).json({ error: "Cliente não encontrado." });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/clientes
exports.criarCliente = async (req, res, next) => {
  try {
    const { nome, cpf_cnpj, email, telefone, endereco, observacoes } = req.body;
    if (!nome)
      return res.status(400).json({ error: 'Campo "nome" é obrigatório.' });

    const [result] = await pool.query(
      "INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, observacoes) VALUES (?, ?, ?, ?, ?, ?)",
      [
        nome,
        cpf_cnpj || null,
        email || null,
        telefone || null,
        endereco || null,
        observacoes || null,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "CPF/CNPJ já cadastrado para outro usuário." });
    }
    next(err);
  }
};

// PUT /api/clientes/:id
exports.atualizarCliente = async (req, res, next) => {
  try {
    const { nome, cpf_cnpj, email, telefone, endereco, observacoes } = req.body;
    const { id } = req.params;

    if (!nome)
      return res.status(400).json({ error: 'Campo "nome" é obrigatório. ' });

    const [existing] = await pool.query("SELECT * FROM clientes WHERE id = ?", [
      id,
    ]);

    if (!existing.length)
      return res.status(404).json({ error: "Cliente não encontrado." });

    await pool.query(
      `UPDATE clientes SET nome = ?, cpf_cnpj = ?, email = ?, telefone = ?, endereco = ?, observacoes = ? WHERE id = ?`,
      [
        nome,
        cpf_cnpj || null,
        email || null,
        telefone || null,
        endereco || null,
        observacoes || null,
        id,
      ],
    );

    const [rows] = await pool.query("SELECT * FROM clientes WHERE id = ?", [
      id,
    ]);

    res.json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "CPF/CNPJ já cadastrado para outro cliente" });
    }

    next(err);
  }
};

// DELETE /api/clientes/:id
exports.deletarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM clientes WHERE id = ?",
      [id],
    );

    if (!existing.length)
      return res.status(404).json({
        error: "Cliente não encontrado.",
      });

    // FK com ON DELETE RESTRICT - cliente com processos não pode ser deletado
    await pool.query("DELETE FROM clientes WHERE id = ?", [id]);
    res.status(204).send();
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "Cliente possui processos vinculados e não pode ser excluído. ",
      });
    }
    next(err);
  }
};
