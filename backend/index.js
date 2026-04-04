import "dotenv/config";
import express from "express";
import cors from "cors";

import clientesRouter from "./src/routes/clientes";
import processosRouter from "./src/routes/processos";
import andamentosRouter from "./src/routes/andamentos";
import prazosRouter from "./src/routes/prazos";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/clientes", clientesRouter);
app.use("/api/processos", processosRouter);
app.use("/api/andamentos", andamentosRouter);
app.use("/api/prazos", prazosRouter);

// Health check
app.get("/api/health", (_req, rej) => res.json({ status: "ok" }));

// Handler de erros genéricos
app.use((err, _req, res, _next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Erro interno do servidor" });
});

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
