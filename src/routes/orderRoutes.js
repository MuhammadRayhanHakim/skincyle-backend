const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");

// 🚀 DISERAGAMKAN: Menggunakan sub-path yang bersih dan aman
router.get("/orders", verifyToken, orderController.getAllOrdersForAdmin);
router.put(
  "/orders/:id_riwayat/status",
  verifyToken,
  orderController.updateOrderStatus,
);

module.exports = router;
