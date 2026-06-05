// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();

// const { sequelize } = require("./src/models");
// const authRoutes = require("./src/routes/authRoutes");
// const recycleRoutes = require("./src/routes/recycleRoutes");
// const forumRoutes = require("./src/routes/forumRoutes");
// const profileRoutes = require("./src/routes/profileRoutes");
// const ensiklopediaRoutes = require("./src/routes/ensiklopediaRoutes");
// const kandunganRoutes = require("./src/routes/kandunganRoutes");
// const partnerRoutes = require("./src/routes/partnerRoutes");
// const adminRoutes = require("./src/routes/adminRoutes");
// const notifikasiRoutes = require("./src/routes/notifikasiRoutes");
// const keranjangRoutes = require("./src/routes/keranjangRoutes");
// const produkRoutes = require("./src/routes/produkRoutes");
// const checkoutRoutes = require("./src/routes/checkoutRoutes");
// const orderRoutes = require("./src/routes/orderRoutes");

// const app = express();

// // --- MIDDLEWARE ---
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//   }),
// );
// app.use(express.json());

// // Sinkronisasi jalur folder uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // --- REGISTRASI ROUTES ---
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/forum", forumRoutes);
// app.use("/api/recycle", recycleRoutes);
// app.use("/api/ensiklopedia", ensiklopediaRoutes);
// app.use("/api/kandungan", kandunganRoutes);
// app.use("/api/partner", partnerRoutes);
// app.use("/api/notifikasi", notifikasiRoutes);
// app.use("/api/keranjang", keranjangRoutes);
// app.use("/api/produk", produkRoutes);
// app.use("/api/checkout", checkoutRoutes);
// app.use("/api", orderRoutes);

// app.get("/", (req, res) => res.send("SkinCycle API is Active & Updated"));

// // --- GLOBAL ERROR HANDLER ---
// app.use((req, res) => {
//   res
//     .status(404)
//     .json({ status: "error", message: "Endpoint tidak ditemukan" });
// });

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ DATABASE SKINCYCLE TERKONEKSI");

//     await sequelize.sync({ alter: true });
//     console.log("✅ STRUKTUR DATABASE TELAH DISINKRONISASI");

//     app.listen(PORT, () => {
//       console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Gagal menyalakan server:", err.message);
//   }
// };

// startServer();





const express = require("express");
const cors = require("cors");
const path = require("path");
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
const notifikasiRoutes = require("./src/routes/notifikasiRoutes");
const keranjangRoutes = require("./src/routes/keranjangRoutes");
const produkRoutes = require("./src/routes/produkRoutes");
const checkoutRoutes = require("./src/routes/checkoutRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();

// ── ⚙️ PERBAIKAN MIDDLEWARE CORS DINAMIS (ANTI BLOCKING) ──
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://skincycle-frontend.vercel.app" // Domain utama Vercel kamu
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Mengizinkan request tanpa origin (seperti Postman, mobile apps, atau curl)
      if (!origin) return callback(null, true);
      
      // Jika domain origin terdaftar di dalam array, loloskan
      if (allowedOrigins.indexOf(origin) !== -1 || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error("Akses CORS diblokir oleh keamanan SkinCycle Backend!"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// Sinkronisasi jalur folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- REGISTRASI ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/recycle", recycleRoutes);
app.use("/api/ensiklopedia", ensiklopediaRoutes);
app.use("/api/kandungan", kandunganRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/keranjang", keranjangRoutes);
app.use("/api/produk", produkRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api", orderRoutes);

app.get("/", (req, res) => res.send("SkinCycle API is Active & Updated"));

// --- GLOBAL ERROR HANDLER ---
app.use((req, res) => {
  res
    .status(404)
    .json({ status: "error", message: "Endpoint tidak ditemukan" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DATABASE SKINCYCLE TERKONEKSI");

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