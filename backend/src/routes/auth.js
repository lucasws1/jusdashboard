const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/login", ctrl.login);
router.get("/me", verifyToken, ctrl.me);

module.exports = router;
