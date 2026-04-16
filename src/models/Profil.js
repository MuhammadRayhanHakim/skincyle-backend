const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Profil = sequelize.define(
  "profil_pengguna",
  {
    id_profil: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_akun: { type: DataTypes.INTEGER }, // Foreign Key
    username: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    foto_profil: { type: DataTypes.STRING },
    total_poin: { type: DataTypes.INTEGER, defaultValue: 0 },
    level_pengguna: { type: DataTypes.STRING },
  },
  { freezeTableName: true, timestamps: false },
);

module.exports = Profil;
