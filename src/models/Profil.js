

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
    id_akun: { type: DataTypes.INTEGER },
    username: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    foto_profil: { type: DataTypes.STRING },
    // PERUBAHAN: Poin menjadi Saldo
    total_saldo: { type: DataTypes.INTEGER, defaultValue: 0 },
    level_pengguna: { type: DataTypes.STRING },
    // --- TAMBAHKAN KOLOM INI AGAR TIDAK ERROR LAGI ---
    role: { 
      type: DataTypes.STRING, 
      defaultValue: "user" 
    },
  },
  { 
    freezeTableName: true, 
    timestamps: false 
  }
);

module.exports = Profil;