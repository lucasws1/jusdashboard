/**
 * Script para criar o usuário administrador inicial.
 * Execute uma única vez: node src/database/criar_admin.js
 *
 * Variáveis de ambiente necessárias no .env:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const NOME = process.env.ADMIN_NOME || "Administrador";
const EMAIL = process.env.ADMIN_EMAIL || "lucas@admin.com";
const SENHA = process.env.ADMIN_SENHA || "abc123";

(async () => {
  try {
    const [existing] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [EMAIL],
    );

    if (existing.length) {
      console.log(`Usuário "${EMAIL}" já existe.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(SENHA, 10);
    await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
      [NOME, EMAIL, hash],
    );

    console.log(`✓ Usuário admin criado: ${EMAIL} / ${SENHA}`);
    console.log("  Altere a senha após o primeiro login.");
  } catch (err) {
    console.error("Erro ao criar admin:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
