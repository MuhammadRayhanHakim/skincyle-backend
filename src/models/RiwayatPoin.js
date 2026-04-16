const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RiwayatPoin = sequelize.define(
  "riwayat_poin",
  {
    id_poin: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_profil: { type: DataTypes.INTEGER },
    aktivitas: { type: DataTypes.STRING }, // Contoh: "Daur Ulang Botol"
    jumlah_poin: { type: DataTypes.INTEGER },
    tanggal: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false },
);

module.exports = RiwayatPoin;
