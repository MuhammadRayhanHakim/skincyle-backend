// const multer = require('multer');
// const path = require('path');

// // Konfigurasi penyimpanan
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Pastikan Anda sudah membuat folder 'uploads' di root project
//   },
//   filename: function (req, file, cb) {
//     // Menamai file: timestamp-namaasli.ext
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// // Filter file (hanya gambar)
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Hanya diperbolehkan mengunggah file gambar!'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 2 * 1024 * 1024 } // Batas 2MB
// });

// module.exports = upload;

const multer = require("multer");
const path = require("path");

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Memastikan file masuk ke folder uploads di root
  },
  filename: function (req, file, cb) {
    // Membuat string acak unik untuk menghindari bentrokan saat multi-upload bersamaan
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Menamai file: fieldname-randomstring.ext (Contoh: image1-1715951829-3829103.jpg)
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Filter file (hanya gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya diperbolehkan mengunggah file gambar!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Batas maksimal ukuran 2MB per file
});

module.exports = upload;
