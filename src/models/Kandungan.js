const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Kandungan = sequelize.define(
  "kandungan",
  {
    id_kandungan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kandungan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fungsi: {
      type: DataTypes.TEXT,
    },
    manfaat: {
      type: DataTypes.TEXT, // Disimpan menggunakan pemisah koma (,)
    },
    efek_samping: {
      type: DataTypes.TEXT, // Catatan Keamanan
    },
    jenis_kulit_cocok: {
      type: DataTypes.STRING, // Disimpan menggunakan pemisah koma (,)
    },
    kategori_bahan: {
      type: DataTypes.STRING, // Anti-Aging, Hydrating, Brightening, Menenangkan, Eksfoliasi
      defaultValue: "Semua",
    },
    gambar_bahan: {
      type: DataTypes.STRING,
      defaultValue: "default-ing.jpg",
    },
    status_publikasi: {
      type: DataTypes.STRING, // Published, Draft
      defaultValue: "Published",
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Kandungan;
