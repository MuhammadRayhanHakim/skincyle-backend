const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig"); // Pustaka konfigurasi penyimpanan gambar Anda

router.get("/", verifyToken, profileController.getProfile);
router.put("/update", verifyToken, profileController.updateProfile);
router.post(
  "/upload-photo",
  verifyToken,
  upload.single("foto_profil"),
  profileController.uploadPhotoProfile,
);
router.delete(
  "/delete-photo",
  verifyToken,
  profileController.deletePhotoProfile,
);

module.exports = router;
