const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Stakeholder = db.define(
  "stakeholder",
  {
    id_stakeholder: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo_brand: {
      type: DataTypes.STRING,
    },
    website_resmi: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = Stakeholder;
