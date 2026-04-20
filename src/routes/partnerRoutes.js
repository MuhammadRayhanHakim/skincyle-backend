const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const authMiddleware = require("../middleware/authMiddleware");

// Publik (Bisa dilihat tanpa login)
router.get("/list", partnerController.getPartners);
router.get("/rewards", partnerController.getRewards);
// Tambahkan baris ini di bawah route redeem
router.get("/my-vouchers", authMiddleware, partnerController.getMyVouchers);
// Privat (Harus Login untuk tukar poin)
router.post("/redeem", authMiddleware, partnerController.redeemVoucher);

module.exports = router;
