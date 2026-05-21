// src/routes/keranjangRoutes.js
const express = require("express");
const router = express.Router();
const keranjangController = require("../controllers/keranjangController");
const authMiddleware = require("../middleware/authMiddleware");

// Pengamanan opsional: gunakan verifyToken jika user harus login terlebih dahulu
const verifyToken = authMiddleware.verifyToken || ((req, res, next) => next());

router.get("/", verifyToken, keranjangController.getCartItems);
router.post("/", verifyToken, keranjangController.addToCart);
router.put("/:id", verifyToken, keranjangController.updateCartQty);
router.delete("/:id", verifyToken, keranjangController.deleteCartItem);

module.exports = router;
