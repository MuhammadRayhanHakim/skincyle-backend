const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LaporanDaurUlang = sequelize.define(
  "laporan_daur_ulang",
  {
    id_laporan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // WAJIB DITAMBAHKAN: Kolom untuk menampung ID User/Profil
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "profil_pengguna", // Nama tabel profil di DB
        key: "id_profil",
      },
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Sesuaikan dengan Postman (Anda mengirim "kategori" di Postman)
    kategori: {
      type: DataTypes.STRING,
    },
    status_daur_ulang: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      defaultValue: "pending",
    },
    lokasi_drop_point: {
      type: DataTypes.STRING,
      defaultValue: "Pusat Daur Ulang Bekasi", // Contoh default
    },
    poin_didapat: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // Bagus untuk tahu kapan user setor botol
  },
);

module.exports = LaporanDaurUlang;
