const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    brand: { type: DataTypes.STRING },
    ph_level: { type: DataTypes.FLOAT },
    suitable_skin_type: { 
        type: DataTypes.STRING // Contoh: "Oily", "Dry", dll
    },
    description: { type: DataTypes.TEXT }
});

module.exports = Product;