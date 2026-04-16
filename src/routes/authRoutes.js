const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Mengarahkan URL /register ke fungsi register di controller
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
