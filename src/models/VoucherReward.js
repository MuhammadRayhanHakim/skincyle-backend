const { DataTypes } = require("sequelize");
const db = require("../config/db");

const VoucherReward = db.define(
  "voucher_reward",
  {
    id_voucher: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_voucher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi_voucher: {
      type: DataTypes.TEXT,
    },
    poin_dibutuhkan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipe_voucher: {
      type: DataTypes.STRING,
      defaultValue: "Hybrid",
    },
    masa_berlaku: {
      type: DataTypes.DATEONLY,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = VoucherReward;
