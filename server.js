const express = require("express");
const cors = require("cors");
require("dotenv").config();

/**
 * PENJELASAN:
 * Kita arahkan require ke folder './src/...' karena
 * folder models dan routes Anda ada di dalam folder src.
 */
const { sequelize } = require("./src/models");
const authRoutes = require("./src/routes/authRoutes");
const recycleRoutes = require("./src/routes/recycleRoutes");
const forumRoutes = require("./src/routes/forumRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/forum", forumRoutes);
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

    // sync({ force: false }) menjaga agar data tidak hilang
    await sequelize.sync({ force: false });

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Gagal menyalakan server:", err.message);
  }
};

startServer();
