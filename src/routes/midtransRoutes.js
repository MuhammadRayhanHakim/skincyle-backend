const express = require("express");
const router = express.Router();
const midtransController = require("../controllers/midtransController");

// Endpoint penampung notifikasi otomatis dari Core Server Midtrans
router.post("/midtrans/callback", midtransController.handleNotification);

module.exports = router;
