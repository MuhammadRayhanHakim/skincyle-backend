const { Sequelize } = require("sequelize");
require("dotenv").config();

// Otomatis mendeteksi environment produksi berdasarkan variabel di Railway
const isProduction =
  process.env.NODE_ENV === "production" || process.env.PGSSLMODE === "require";

const sequelize = new Sequelize(
  process.env.DB_NAME || "project_skincycle",
  process.env.DB_USER || "postgres",
  process.env.DB_PASS || "12345678",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // Ubah ke console.log jika ingin melihat log query SQL di terminal
    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, // 🚀 FIX MUTLAK: Mengizinkan server Railway menembus enkripsi SSL Neon DB
          },
        }
      : {}, // Jika berjalan di laptop (localhost), dialectOptions dikosongkan biasa
  },
);

module.exports = sequelize;
