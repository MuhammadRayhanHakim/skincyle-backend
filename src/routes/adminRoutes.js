const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Middleware authMiddleware dipasang agar tidak sembarang orang bisa akses
// Note: Kedepannya kamu bisa tambah middleware 'isAdmin' untuk keamanan ekstra
// 1. Endpoint untuk Admin mengonfirmasi berat sampah dan mencairkan saldo
router.post(
  "/verify-recycle", 
  authMiddleware, 
  adminController.verifikasiDanCairkanSaldo
);

// 2. Endpoint untuk Admin melihat semua daftar jemputan yang masuk (Pending)
// router.get("/pending-reports", authMiddleware, adminController.getAllPendingReports);

module.exports = router;