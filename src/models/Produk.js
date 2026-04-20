const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Produk = db.define(
  "produk",
  {
    id_produk: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
    },
    deskripsi_produk: {
      type: DataTypes.TEXT,
    },
    // Elemen untuk Ensiklopedia/Analisis Kandungan
    ph_level: {
      type: DataTypes.FLOAT,
    },
    suitable_skin_type: {
      type: DataTypes.STRING, // Contoh: "Oily", "Dry"
    },
    // Elemen untuk Partner/E-commerce
    harga_asli: {
      type: DataTypes.INTEGER,
    },
    gambar_produk: {
      type: DataTypes.STRING,
    },
    link_pembelian: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Produk;
