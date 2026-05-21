// routes/recycleRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const authMiddleware = require("../middleware/authMiddleware");
const recycleController = require("../controllers/recycleController");

// HAPUS baris yang lama, gunakan SATU baris ini saja:
router.post(
  "/drop-verify",
  authMiddleware,
  upload.single("foto_bukti"),
  recycleController.submitDropVerify,
);

router.get(
  "/user-history",
  authMiddleware,
  recycleController.getUserRecycleHistory,
);

module.exports = router;
