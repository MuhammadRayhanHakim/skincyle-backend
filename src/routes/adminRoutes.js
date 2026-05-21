// // src/routes/adminRoutes.js
// const express = require("express");
// const router = express.Router();
// const adminController = require("../controllers/adminController");
// const authMiddleware = require("../middleware/authMiddleware");

// // 1. Endpoint untuk mengambil semua laporan masuk (Dashboard Admin)
// // Tambahkan baris ini:
// router.get(
//   "/all-laporan",
//   authMiddleware,
//   adminController.getAllLaporanRecycle,
// );

// // 2. Endpoint untuk Verifikasi & Cairkan Saldo
// router.post(
//   "/verify-recycle",
//   authMiddleware,
//   adminController.verifikasiDanCairkanSaldo,
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Endpoint untuk mengambil semua laporan (Dashboard Admin)
// Pastikan path ini sesuai dengan yang dipanggil Frontend
router.get(
  "/all-laporan",
  authMiddleware,
  adminController.getAllLaporanRecycle,
);

// Endpoint verifikasi
router.post(
  "/verify-recycle",
  authMiddleware,
  adminController.verifikasiDanCairkanSaldo,
);

router.post(
  "/final-recycle",
  authMiddleware,
  adminController.finalisasiDanKirimSaldo,
);

module.exports = router;
