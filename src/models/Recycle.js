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
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Menyimpan rincian sampah dari tombol + (contoh: [{"item": "botol", "qty": 2}])
    rincian_karung_visual: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    alamat_penjemputan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estimasi_berat: {
      type: DataTypes.FLOAT,
    },
    foto_bukti_fisik: {
      type: DataTypes.STRING, // URL/Path foto
    },
    status_jemput: {
      type: DataTypes.ENUM(
        "menunggu_verifikasi",
        "proses_jemput",
        "selesai",
        "ditolak",
      ),
      defaultValue: "menunggu_verifikasi",
    },
    saldo_cair: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Baru diisi oleh admin setelah ditimbang
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  },
);

module.exports = LaporanDaurUlang;
