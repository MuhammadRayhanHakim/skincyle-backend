const express = require("express");
const router = express.Router();
const notifikasiController = require("../controllers/notifikasiController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // Semua rute notif butuh login

router.get("/", notifikasiController.getNotifikasi);
router.get("/unread", notifikasiController.getUnreadCount);
router.put("/read", notifikasiController.markAsRead);

module.exports = router;
