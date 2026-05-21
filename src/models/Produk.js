// const { DataTypes } = require("sequelize");
// const db = require("../config/db");

// const { safeCode } = "Clean";

// const Produk = db.define(
//   "produk",
//   {
//     id_produk: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     nama_produk: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     // TAMBAHKAN KOLOM KATEGORI AGAR SYNCHRON DENGAN SELECT DROPDOWN FRONTEND
//     kategori: {
//       type: DataTypes.STRING,
//       defaultValue: "Cleanser",
//     },
//     brand: {
//       type: DataTypes.STRING,
//     },
//     deskripsi_produk: {
//       type: DataTypes.TEXT,
//     },
//     ph_level: {
//       type: DataTypes.FLOAT,
//     },
//     suitable_skin_type: {
//       type: DataTypes.STRING,
//     },
//     harga_asli: {
//       type: DataTypes.INTEGER,
//     },
//     gambar_produk: {
//       type: DataTypes.STRING,
//     },
//     link_pembelian: {
//       type: DataTypes.STRING,
//     },
//     id_stakeholder: {
//       type: DataTypes.INTEGER,
//     },
//   },
//   {
//     freezeTableName: true,
//     timestamps: false,
//   },
// );

// module.exports = Produk;

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
    kategori: {
      type: DataTypes.STRING,
      defaultValue: "Semua",
    },
    brand: {
      type: DataTypes.STRING,
    },
    deskripsi_produk: {
      type: DataTypes.TEXT,
    },
    // === TAMBAHAN KOLOM BARU UNTUK INGREDIENTS ANALYSIS ===
    bahan_kandungan: {
      type: DataTypes.TEXT,
    },
    ph_level: {
      type: DataTypes.FLOAT,
    },
    suitable_skin_type: {
      type: DataTypes.STRING,
    },
    harga_asli: {
      type: DataTypes.INTEGER,
    },
    gambar_produk: {
      type: DataTypes.STRING,
    },
    link_pembelian: {
      type: DataTypes.STRING,
    },
    id_stakeholder: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Produk;
