const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/prazosController");

router.get("/", ctrl.listarPrazos);
router.get("/proximos", ctrl.proximos);
router.get("/:id", ctrl.buscarPrazo);
router.post("/", ctrl.criarPrazo);
router.put("/:id", ctrl.atualizarPrazo);
router.delete("/:id", ctrl.deletarPrazo);

module.exports = router;
