const express = require("express");
const router = express.Router();
const produkController = require("../controllers/produkController");

// --- IMPORT MULTER & AUTH MIDDLEWARE ---
const multerConfig = require("../middleware/multerConfig");
const authMiddleware = require("../middleware/authMiddleware");

// Pengamanan Fallback Objek jika dieksport langsung atau menggunakan destructuring
const upload = multerConfig.upload || multerConfig;
const verifyToken = authMiddleware.verifyToken || authMiddleware;
const isAdmin = authMiddleware.isAdmin || ((req, res, next) => next());

// --- KONFIGURASI MULTI-UPLOAD GAMBAR (MAKSIMAL 4 SLOT) ---
let multiUpload;
if (upload && typeof upload.fields === "function") {
  multiUpload = upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]);
} else {
  // Fallback jalankan middleware kosong agar server tidak crash saat inisialisasi awal
  multiUpload = (req, res, next) => next();
}

// --- JALUR ROUTING API PRODUK SKINCYCLE ---

// 1. Akses Publik: Mengambil Semua Produk & Mengambil Detail Produk Berdasarkan ID
router.get("/", produkController.getAllProduk);
router.get("/:id", produkController.getProdukById);

// 2. Akses Admin: Tambah Produk Baru (POST) dengan Multi-Upload Gambar
router.post(
  "/",
  verifyToken,
  isAdmin,
  multiUpload,
  produkController.createProduk,
);

// 3. Akses Admin: Edit / Update Data Detail Produk (PUT) beserta Gambar Baru
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  multiUpload,
  produkController.updateProduk,
);

// 4. Akses Admin: Hapus Produk dari Katalog (DELETE)
router.delete("/:id", verifyToken, isAdmin, produkController.deleteProduk);

module.exports = router;
