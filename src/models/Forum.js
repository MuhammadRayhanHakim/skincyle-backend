const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Forum = sequelize.define(
  "posting_forum",
  {
    id_posting: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Foreign Key ke Profil Pengguna
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    judul_posting: {
      type: DataTypes.STRING(255), // Membatasi panjang agar efisien di DB
      allowNull: false,
    },
    isi_posting: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Tetap STRING (VARCHAR) agar tidak bentrok dengan error ENUM sebelumnya
    kategori: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Tips & Trik",
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    anonim: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tanggal_posting: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true, // Menjamin Sequelize tidak mengubah nama tabel jadi jamak
    timestamps: false, // Karena kita sudah punya tanggal_posting manual
  },
);

module.exports = Forum;
