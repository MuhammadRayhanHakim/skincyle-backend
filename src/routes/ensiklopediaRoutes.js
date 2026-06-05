const express = require("express");
const router = express.Router();
const ensiklopediaController = require("../controllers/ensiklopediaController");
const upload = require("../middleware/multerConfig");

// Jalur GET: Membaca seluruh list artikel
router.get("/", ensiklopediaController.getAllArtikel);

// Jalur POST: Membuat artikel baru dengan upload gambar
router.post("/", upload.single("gambar"), ensiklopediaController.createArtikel);

// 🆕 Jalur PUT: Mengedit artikel berdasarkan ID (Sediakan middleware upload.single kalau sewaktu-waktu ganti gambar)
router.put(
  "/:id",
  upload.single("gambar"),
  ensiklopediaController.updateArtikel,
);

// 🆕 Jalur DELETE: Menghapus artikel berdasarkan ID
router.delete("/:id", ensiklopediaController.deleteArtikel);

module.exports = router;
