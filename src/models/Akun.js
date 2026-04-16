const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Akun = sequelize.define(
  "akun_pengguna",
  {
    id_akun: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    kata_sandi: { type: DataTypes.STRING, allowNull: false },
    tanggal_daftar: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status_akun: { type: DataTypes.STRING },
  },
  { freezeTableName: true, timestamps: false },
);

module.exports = Akun;
