const { DataTypes } = require("sequelize");
const db = require("../config/db");

const RedeemTransaction = db.define(
  "redeem_transaksi",
  {
    id_redeem: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    kode_unik_redeem: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status_pakai: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tanggal_redeem: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    tanggal_digunakan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = RedeemTransaction;
