const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Komentar = sequelize.define(
  "komentar_forum",
  {
    id_komentar: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // 🟢 SUNTIKKAN AKUN PROFIL & POSTING INDUK (Pastikan ini terdefinisi)
    id_posting: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 🚀 FIX MUTLAK DATABASE: Daftarkan kolom induk komentar agar backend bisa menyimpannya!
    id_komentar_induk: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isi_komentar: { type: DataTypes.TEXT, allowNull: false },
    anonim: { type: DataTypes.BOOLEAN, defaultValue: false },
    tanggal_komentar: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false },
);

module.exports = Komentar;
