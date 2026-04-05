require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // lê form data

// Rotas
const clientesRouter = require("./src/routes/clientes");
const processosRouter = require("./src/routes/processos");
const andamentosRouter = require("./src/routes/andamentos");
const prazosRouter = require("./src/routes/prazos");
app.use("/api/clientes", clientesRouter);
app.use("/api/processos", processosRouter);
app.use("/api/andamentos", andamentosRouter);
app.use("/api/prazos", prazosRouter);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Handler de erros genéricos
app.use((err, _req, res, _next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
