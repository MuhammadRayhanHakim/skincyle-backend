const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TransaksiBelanja = sequelize.define(
  "transaksi_belanja",
  {
    id_belanja: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_riwayat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nomor_telepon: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    alamat_rumah: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    jenis_pembelian: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "saldo",
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  },
);

module.exports = TransaksiBelanja;
