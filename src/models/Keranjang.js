// src/models/Keranjang.js
const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Produk = require("./Produk"); // Relasi ke tabel produk

const Keranjang = db.define(
  "keranjang",
  {
    id_keranjang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pengguna: {
      type: DataTypes.INTEGER,
      allowNull: false, // Untuk mencatat keranjang milik user siapa (bisa diambil dari token)
    },
    id_produk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "produk",
        key: "id_produk",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

// Gabungkan relasi agar saat get data keranjang, info detail produk otomatis terbawa
Keranjang.belongsTo(Produk, { foreignKey: "id_produk" });

module.exports = Keranjang;
