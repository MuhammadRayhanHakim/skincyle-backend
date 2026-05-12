const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ForumLike = sequelize.define(
  "forum_likes",
  {
    id_like: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_posting: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "posting_forum",
        key: "id_posting",
      },
    },
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "profil_pengguna",
        key: "id_profil",
      },
    },
    tanggal_like: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

module.exports = ForumLike;
