const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { sequelize } = require("./src/models");
const authRoutes = require("./src/routes/authRoutes");
const recycleRoutes = require("./src/routes/recycleRoutes"); //
const forumRoutes = require("./src/routes/forumRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const ensiklopediaRoutes = require("./src/routes/ensiklopediaRoutes");
const kandunganRoutes = require("./src/routes/kandunganRoutes");
const partnerRoutes = require("./src/routes/partnerRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const notifikasiRoutes = require("./src/routes/notifikasiRoutes");
const keranjangRoutes = require("./src/routes/keranjangRoutes");
const produkRoutes = require("./src/routes/produkRoutes");
const checkoutRoutes = require("./src/routes/checkoutRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();

// --- CONFIG MIDDLEWARE CORS (MENDUKUNG LOKAL & ONLINE PRODUCTION) ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean); //

// const allowedOrigins =
//   process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || [];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // allow requests tanpa origin contoh: Postman, mobile apps, curl
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error(`CORS blocked: ${origin}`));
//     },

//     credentials: true,

//     methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],

//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

app.options(/.*/, cors());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        //
        callback(null, true);
      } else {
        callback(
          new Error("Akses diblokir oleh kebijakan keamanan CORS SkinCycle!"),
        ); //
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }), //
);

app.use(express.json()); //
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //

// --- REGISTRASI ROUTES UTAMA (DENGAN PREFIX /api) ---
app.use("/api/auth", authRoutes); //
app.use("/api/admin", adminRoutes); //
app.use("/api/profile", profileRoutes); //
app.use("/api/forum", forumRoutes); //
app.use("/api/recycle", recycleRoutes); //
app.use("/api/daur-ulang", recycleRoutes); //

// 🌟 FIX MUTLAK SINKRONISASI FRONTEND (TANPA PREFIX /api) 🌟
// Baris ini wajib dipasang untuk menangkap request 'POST /recycle/drop-verify' sesuai log konsol browser Anda!
app.use("/recycle", recycleRoutes);
app.use("/daur-ulang", recycleRoutes);

app.use("/api/ensiklopedia", ensiklopediaRoutes); //
app.use("/api/kandungan", kandunganRoutes); //
app.use("/api/partner", partnerRoutes); //
app.use("/api/notifikasi", notifikasiRoutes); //
app.use("/api/keranjang", keranjangRoutes); //
app.use("/api/produk", produkRoutes); //
app.use("/api/checkout", checkoutRoutes); //
app.use("/api", orderRoutes); //

app.get("/", (req, res) => res.send("SkinCycle API is Active & Updated")); //

// --- GLOBAL ERROR HANDLER ---
app.use((req, res) => {
  res
    .status(404)
    .json({ status: "error", message: "Endpoint tidak ditemukan" }); //
});

const PORT = process.env.PORT || 5000; //

const startServer = async () => {
  try {
    await sequelize.authenticate(); //
    console.log("✅ DATABASE SKINCYCLE TERKONEKSI"); //

    await sequelize.sync({ alter: true }); //
    console.log("✅ STRUKTUR DATABASE TELAH DISINKRONISASI"); //

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`); //
    });
  } catch (err) {
    console.error("❌ Gagal menyalakan server:", err.message); //
  }
};

startServer(); //
