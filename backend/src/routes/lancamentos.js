const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/lancamentosController");

router.get("/", ctrl.listarLancamentos);
router.get("/:id", ctrl.buscarLancamento);
router.post("/", ctrl.criarLancamento);
router.put("/:id", ctrl.atualizarLancamento);
router.delete("/:id", ctrl.deletarLancamento);

module.exports = router;
