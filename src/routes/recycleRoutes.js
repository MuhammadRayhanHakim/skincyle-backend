const express = require('express');
const router = express.Router();
const recycleController = require('../controllers/recycleController');
const authMiddleware = require("../middleware/authMiddleware"); 

// Menggunakan fungsi submitDropVerify yang baru saja kita buat
router.post('/drop-verify', authMiddleware, recycleController.submitDropVerify);

// (Opsional) Route untuk melihat riwayat sampah user sendiri
// router.get('/history', authMiddleware, recycleController.getHistory);

module.exports = router;