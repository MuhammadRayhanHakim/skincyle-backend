const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Komentar = sequelize.define(
  "komentar_forum",
  {
    id_komentar: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isi_komentar: { type: DataTypes.TEXT, allowNull: false },
    tanggal_komentar: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { freezeTableName: true, timestamps: false },
);

module.exports = Komentar;
