const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/clientesController");

router.get("/", ctrl.listarClientes);
router.get("/:id", ctrl.buscarCliente);
router.post("/", ctrl.criarCliente);
router.put("/:id", ctrl.atualizarCliente);
router.delete("/:id", ctrl.deletarCliente);

module.exports = router;
