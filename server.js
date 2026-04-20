const express = require("express");
const cors = require("cors");
require("dotenv").config();

/**
 * PENJELASAN:
 * Mengimpor database dan semua routing dari folder src.
 */
const { sequelize } = require("./src/models");
const authRoutes = require("./src/routes/authRoutes");
const recycleRoutes = require("./src/routes/recycleRoutes");
const forumRoutes = require("./src/routes/forumRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const ensiklopediaRoutes = require("./src/routes/ensiklopediaRoutes");
const kandunganRoutes = require("./src/routes/kandunganRoutes");
const partnerRoutes = require("./src/routes/partnerRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Jalur statis untuk gambar (Penting jika Anda simpan gambar brand/produk secara lokal)
app.use("/uploads", express.static("public/uploads"));

// -- REGISTRASI ROUTES --
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/recycle", recycleRoutes);
app.use("/api/ensiklopedia", ensiklopediaRoutes);
app.use("/api/kandungan", kandunganRoutes);

// Route untuk Bisnis & Reward (Stakeholder & Produk)
app.use("/api/partner", partnerRoutes);

if (recycleRoutes) {
  app.use("/api/daur-ulang", recycleRoutes);
}

// Route cek koneksi
app.get("/", (req, res) => res.send("SkinCycle API is Active"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DATABASE SKINCYCLE TERKONEKSI");

    /**
     * PENTING:
     * Gunakan force: false agar data manual yang Anda masukkan via SQLTools
     * (data stakeholder, produk, voucher) TIDAK TERHAPUS.
     */
    await sequelize.sync({ force: false });

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Gagal menyalakan server:", err.message);
  }
};

startServer();
