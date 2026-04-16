const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Kandungan = sequelize.define('kandungan', {
    id_kandungan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_kandungan: { type: DataTypes.STRING, allowNull: false },
    fungsi: { type: DataTypes.TEXT },
    manfaat: { type: DataTypes.TEXT },
    efek_samping: { type: DataTypes.TEXT },
    jenis_kulit_cocok: { type: DataTypes.STRING }
}, { freezeTableName: true, timestamps: false });

module.exports = Kandungan;