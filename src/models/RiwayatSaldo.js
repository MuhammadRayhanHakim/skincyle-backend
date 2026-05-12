const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RiwayatSaldo = sequelize.define(
  "riwayat_saldo",
  {
    id_riwayat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    aktivitas: {
      type: DataTypes.STRING,
    }, // Contoh: "Pencairan Saldo Recycle #12"
    jumlah_saldo: {
      type: DataTypes.INTEGER,
    }, // Nilai dalam Rupiah
    tipe_transaksi: {
      type: DataTypes.ENUM("masuk", "keluar"),
      defaultValue: "masuk",
    }, // 'masuk' untuk recycle, 'keluar' untuk redeem voucher
    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = RiwayatSaldo;
