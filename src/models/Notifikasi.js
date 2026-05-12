const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notifikasi = sequelize.define(
  "notifikasi",
  {
    id_notifikasi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_profil_penerima: { type: DataTypes.INTEGER, allowNull: false },
    id_profil_pengirim: { type: DataTypes.INTEGER, allowNull: false },
    id_posting: { type: DataTypes.INTEGER, allowNull: false },
    tipe: {
      // Menggunakan string dengan validasi agar lebih aman di PostgreSQL
      type: DataTypes.ENUM("like", "komentar"),
      allowNull: false,
    },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    tanggal: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Notifikasi;
