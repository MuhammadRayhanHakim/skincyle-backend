

const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produkController");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

// Konfigurasi Penyimpanan Gambar
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Menambahkan random number agar nama file gambar yang diupload bersamaan tidak bentrok
    cb(
      null,
      "prod-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage });

const verifyToken =
  authMiddleware.verifyToken || authMiddleware || ((req, res, next) => next());
const isAdmin = authMiddleware.isAdmin || ((req, res, next) => next());

// 🌟 FIX UTAMA BACKEND: Menggunakan .array() dengan nama field ber-bracket "[]"
// Mendukung unggah massal maksimal 4 gambar sekaligus secara aman dari panel admin
const multiUpload = upload.array("gambar_produk[]", 4);

// 1. Jalur Akses Publik
router.get("/", produkController.getAllProduk);
router.get("/:id", produkController.getProdukById);

// 2. Jalur Akses Operasional Administrator Manajemen
router.post(
  "/",
  verifyToken,
  isAdmin,
  multiUpload,
  produkController.createProduk,
);
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  multiUpload,
  produkController.updateProduk,
);
router.delete("/:id", verifyToken, isAdmin, produkController.deleteProduk);

module.exports = router;
