

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
    id_profil_penerima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_profil_pengirim: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // --- KOLOM UNTUK FITUR FORUM ---
    id_posting: {
      type: DataTypes.INTEGER,
      allowNull: true, // Harus true agar sistem Daur Ulang tidak error
    },
    id_komentar: {
      type: DataTypes.INTEGER,
      allowNull: true, // Harus true agar sistem Like/Daur Ulang tidak error
    },
    // --- KOLOM UNTUK FITUR DAUR ULANG ---
    id_laporan: {
      type: DataTypes.INTEGER,
      allowNull: true, // Harus true agar sistem Forum tidak error
    },
    tipe: {
      type: DataTypes.STRING(50),
      allowNull: false, // Contoh: 'balasan', 'suka', 'penjemputan_diproses', 'saldo_cair'
    },
    pesan: {
      type: DataTypes.TEXT,
      allowNull: true, // Menyimpan isi pesan notifikasi secara fleksibel
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true, // Menjaga nama tabel tetap 'notifikasi'
    timestamps: false,
  },
);

module.exports = Notifikasi;
