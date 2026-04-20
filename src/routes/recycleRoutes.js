const express = require('express');
const router = express.Router();
const recycleController = require('../controllers/recycleController');
const authMiddleware = require("../middleware/authMiddleware"); 

// Pastikan fungsi submitLaporan ada di recycleController
router.post('/submit', authMiddleware, recycleController.submitLaporan || ((req, res) => res.send("Controller belum siap")));

module.exports = router;