// const express = require("express");
// const router = express.Router();

// const profileController = require("../controllers/profileController");

// const verifyToken = require("../middleware/authMiddleware");
// const upload = require("../middleware/multerConfig");

// // Ambil profil user
// router.get("/", verifyToken, profileController.getProfile);

// // Statistik profil
// router.get("/stats", verifyToken, profileController.getProfileStats);

// // Update profil
// router.put("/update", verifyToken, profileController.updateProfile);

// // Upload foto profil
// router.post(
//   "/upload-photo",
//   verifyToken,
//   upload.single("foto_profil"),
//   profileController.uploadPhotoProfile,
// );

// // Hapus foto profil
// router.delete(
//   "/delete-photo",
//   verifyToken,
//   profileController.deletePhotoProfile,
// );

// module.exports = router;


















const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");

// ─── 1. ENDPOINT MEMBACA DATA PROFIL ───
// Mengambil profil user aktif berdasarkan token Jwt
router.get("/", verifyToken, profileController.getProfile);

// Mengambil data metrik timbangan & saldo live untuk halaman Riwayat & Forum
router.get("/stats", verifyToken, profileController.getProfileStats);

// ─── 2. ENDPOINT MODIFIKASI DATA PROFIL (SINKRON FRONTEND) ───

// 1: Mengubah '/update' menjadi '/profile/:id' agar klop dengan aksi handleSave frontend
router.put("/profile/:id", verifyToken, profileController.updateProfile);

// 2: Mengubah '/upload-photo' (POST) menjadi '/profile/:id/photo' (PUT)
// Ini disesuaikan dengan fungsi handleSave frontend yang menyatukan teks & file foto lewat FormData
router.put(
  "/profile/:id/photo",
  verifyToken,
  upload.single("foto_profil"),
  profileController.uploadPhotoProfile,
);

// 3: Mengubah '/delete-photo' menjadi '/profile/:id/photo' agar seirama dengan handleRemovePhoto frontend
router.delete(
  "/profile/:id/photo",
  verifyToken,
  profileController.deletePhotoProfile,
);

module.exports = router;
