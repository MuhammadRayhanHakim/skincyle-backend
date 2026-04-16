const express = require('express');
const router = express.Router();
const recycleController = require('../controllers/recycleController');

// Pastikan fungsi submitLaporan ada di recycleController
router.post('/submit', recycleController.submitLaporan || ((req, res) => res.send("Controller belum siap")));

module.exports = router;