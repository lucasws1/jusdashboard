const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/processosController");

router.get("/", ctrl.listarProcessos);
router.get("/:id", ctrl.buscarProcessos);
router.post("/", ctrl.criarProcesso);
router.put("/:id", ctrl.atualizarProcesso);
router.delete("/:id", ctrl.deletarProcesso);
