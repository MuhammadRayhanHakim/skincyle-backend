const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// =========================================================================
// CONFIGURATION ENGINE: MULTER DISK STORAGE LOGISTICS
// =========================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Memastikan berkas disimpan ke dalam folder 'uploads' di root direktori backend Anda
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generate nama file unik menggunakan penanda waktu + angka acak untuk mencegah bentrok nama file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter validasi tipe ekstensi berkas (Hanya menerima format gambar standar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Format berkas tidak didukung! Hanya diperbolehkan mengunggah gambar (.jpg, .jpeg, .png, .gif, .webp)",
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Membatasi ukuran maksimal berkas sebesar 10MB sesuai instruksi frontend
});

// =========================================================================
// ROUTING MANAGEMENT SYSTEM
// =========================================================================

// --- 1. RUTE PUBLIC (Bisa diakses oleh pengunjung tanpa token login) ---
router.get("/", forumController.getPosts);
router.get("/:id_posting", forumController.getPostDetail);

// --- 2. PROTECTED ROUTES (Wajib melewati verifikasi JSON Web Token) ---
router.use(authMiddleware);

// PERBAIKAN UTAMA: Menyematkan upload.single("media") agar req.body tidak bernilai undefined saat menerima FormData
router.post("/", upload.single("media"), forumController.createPost);

router.put("/:id_posting", upload.single("media"), forumController.updatePost);
router.delete("/:id_posting", forumController.deletePost); // <--- Duplikasi baris di bagian bawah sudah dihapus
router.post("/comment/:id_posting", forumController.addComment);
router.post("/like/:id_posting", forumController.toggleLike);
// Di forumRoutes.js
router.get(
  "/profil/dampak-komunitas",
  authMiddleware,
  forumController.getUserCommunityImpact,
);
module.exports = router;
