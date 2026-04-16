const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ensiklopedia = sequelize.define('ensiklopedia', {
    id_artikel: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul_artikel: { type: DataTypes.STRING, allowNull: false },
    isi_artikel: { type: DataTypes.TEXT, allowNull: false },
    kategori: { type: DataTypes.STRING },
    gambar: { type: DataTypes.STRING },
    tanggal_publish: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true, timestamps: false });

module.exports = Ensiklopedia;