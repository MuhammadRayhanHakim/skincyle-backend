const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const authMiddleware = require("../middleware/authMiddleware");

// 1. Publik: Melihat semua Brand & Katalog Produknya
router.get("/list", partnerController.getPartners);

// 2. Publik: Melihat detail satu produk (jika fungsi getProdukDetail sudah dibuat)
router.get("/produk/:id", partnerController.getProdukDetail);

// 3. Privat: Checkout produk dengan potongan saldo otomatis
// Ganti /redeem menjadi /checkout agar sesuai dengan alur baru
router.post("/checkout", authMiddleware, partnerController.checkoutProduk);

module.exports = router;
