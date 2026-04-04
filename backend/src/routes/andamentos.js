const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/andamentosController");

router.get("/", ctrl.listarAndamentos);
router.get("/:id", ctrl.buscarAndamento);
router.post("/", ctrl.criarAndamento);
router.put("/:id", ctrl.atualizarAndamento);
router.delete("/:id", ctrl.deletarAndamento);

module.exports = router;
