const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");

// ─── 1. ENDPOINT AUTHENTIKASI DASAR ───
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);

// ─── 2. ENDPOINT PENGATURAN PROFIL SIRKULAR (FIXED MULTIPART PARSING) ───

// 🟢 FIX UTAMA: Menambahkan 'upload.single("foto_profil")' agar req.body tidak lagi undefined saat menerima FormData
router.put(
  "/profile/:id",
  verifyToken,
  upload.single("foto_profil"),
  profileController.updateProfile,
);

// Rute backup untuk upload/ganti foto terpisah
router.put(
  "/profile/:id/photo",
  verifyToken,
  upload.single("foto_profil"),
  profileController.uploadPhotoProfile,
);

// Rute hapus foto profil
router.delete(
  "/profile/:id/photo",
  verifyToken,
  profileController.deletePhotoProfile,
);

module.exports = router;
