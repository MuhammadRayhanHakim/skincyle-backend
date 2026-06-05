// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Recycle = sequelize.define(
//   "Recycle",
//   {
//     id_laporan: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     id_profil: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     rincian_karung_visual: {
//       type: DataTypes.JSONB,
//       allowNull: true,
//     },
//     alamat_penjemputan: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     estimasi_berat: {
//       type: DataTypes.DOUBLE,
//       allowNull: true,
//     },
//     foto_bukti_fisik: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     status_jemput: {
//       type: DataTypes.STRING,
//       defaultValue: "menunggu_verifikasi",
//     },
//     saldo_cair: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },
//   },
//   {
//     tableName: "laporan_daur_ulang",
//     timestamps: true, // Ini akan otomatis menangani kolom createdAt dan updatedAt [cite: 8]
//   },
// );

// module.exports = Recycle;





const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Recycle = sequelize.define(
  "Recycle",
  {
    id_laporan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rincian_karung_visual: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    alamat_penjemputan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // 🚀 TAMBAHKAN DUA KOLOM INI AGAR DATA MAPS USER TIDAK TERBUANG
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    estimasi_berat: {
      type: DataTypes.STRING, // Menyesuaikan input string opsi boks frontend seperti "1-2 kg"
      allowNull: true,
    },
    foto_bukti_fisik: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_jemput: {
      type: DataTypes.STRING,
      defaultValue: "menunggu_verifikasi",
    },
    saldo_cair: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "laporan_daur_ulang",
    timestamps: true,
  },
);

module.exports = Recycle;