const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Forum = sequelize.define('posting_forum', {
    id_posting: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul_posting: { type: DataTypes.STRING, allowNull: false },
    isi_posting: { type: DataTypes.TEXT, allowNull: false },
    kategori: { type: DataTypes.STRING },
    tanggal_posting: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true, timestamps: false });

module.exports = Forum;