const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Endpoint untuk mengambil semua laporan statistik gabungan untuk halaman dashboard utama
router.get(
  "/dashboard-overview",
  authMiddleware,
  adminController.getDashboardOverviewStats,
);

// Endpoint untuk mengambil semua laporan masuk (Halaman Manajemen Laporan)
router.get(
  "/all-laporan",
  authMiddleware,
  adminController.getAllLaporanRecycle,
);

// Endpoint verifikasi perpindahan status (menunggu -> sedang dijemput)
router.post(
  "/verify-recycle",
  authMiddleware,
  adminController.verifikasiDanCairkanSaldo,
);

// Endpoint penyelesaian & transfer dana (sedang dijemput -> selesai)
router.post(
  "/final-recycle",
  authMiddleware,
  adminController.finalisasiDanKirimSaldo,
);

module.exports = router;
