// const express = require("express");
// const router = express.Router();
// const kandunganController = require("../controllers/kandunganController");
// const multer = require("multer");
// const path = require("path");

// // Konfigurasi Penyimpanan Gambar Kandungan
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, "ing-" + Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// router.get("/", kandunganController.getKandungan);
// router.post(
//   "/",
//   upload.single("gambar_bahan"),
//   kandunganController.createKandungan,
// );
// router.put(
//   "/:id",
//   upload.single("gambar_bahan"),
//   kandunganController.updateKandungan,
// );

// module.exports = router;



const express = require("express");
const router = express.Router();
const kandunganController = require("../controllers/kandunganController");
const multer = require("multer");
const path = require("path");

// Konfigurasi Penyimpanan Gambar Kandungan
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "ing-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/", kandunganController.getKandungan);
router.post(
  "/",
  upload.single("gambar_bahan"),
  kandunganController.createKandungan,
);
router.put(
  "/:id",
  upload.single("gambar_bahan"),
  kandunganController.updateKandungan,
);

// PERBAIKAN: Daftarkan rute DELETE di sini agar tombol hapus admin berfungsi!
router.delete("/:id", kandunganController.deleteKandungan);

module.exports = router;
