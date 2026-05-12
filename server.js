const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./src/models");
const authRoutes = require("./src/routes/authRoutes");
const recycleRoutes = require("./src/routes/recycleRoutes");
const forumRoutes = require("./src/routes/forumRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const ensiklopediaRoutes = require("./src/routes/ensiklopediaRoutes");
const kandunganRoutes = require("./src/routes/kandunganRoutes");
const partnerRoutes = require("./src/routes/partnerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const notifikasiRoutes = require("./src/routes/notifikasiRoutes"); // 1. IMPORT RUTE NOTIFIKASI

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Jalur statis untuk upload gambar
app.use("/uploads", express.static("public/uploads"));

// --- REGISTRASI ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/recycle", recycleRoutes);
app.use("/api/ensiklopedia", ensiklopediaRoutes);
app.use("/api/kandungan", kandunganRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/notifikasi", notifikasiRoutes); // 2. AKTIFKAN JALUR API NOTIFIKASI

// Route cek koneksi utama
app.get("/", (req, res) => res.send("SkinCycle API is Active & Updated"));

// --- GLOBAL ERROR HANDLER ---
app.use((req, res, next) => {
  res
    .status(404)
    .json({ status: "error", message: "Endpoint tidak ditemukan" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DATABASE SKINCYCLE TERKONEKSI");

    // Sinkronisasi tabel (Termasuk tabel notifikasi baru)
    await sequelize.sync({ alter: true });
    console.log("✅ STRUKTUR DATABASE TELAH DISINKRONISASI");

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Gagal menyalakan server:", err.message);
  }
};

startServer();
