require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas públicas
const authRouter = require("./src/routes/auth");
app.use("/api/auth", authRouter);

// Health check (público)
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Guard — protege todas as rotas abaixo
const verifyToken = require("./src/middleware/verifyToken");
app.use("/api", verifyToken);

// Rotas protegidas
const clientesRouter = require("./src/routes/clientes");
const processosRouter = require("./src/routes/processos");
const andamentosRouter = require("./src/routes/andamentos");
const prazosRouter = require("./src/routes/prazos");
const lancamentosRouter = require("./src/routes/lancamentos");
app.use("/api/clientes", clientesRouter);
app.use("/api/processos", processosRouter);
app.use("/api/andamentos", andamentosRouter);
app.use("/api/prazos", prazosRouter);
app.use("/api/lancamentos", lancamentosRouter);

// Handler de erros genéricos
app.use((err, _req, res, _next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
