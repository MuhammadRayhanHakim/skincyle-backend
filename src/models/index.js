const sequelize = require("../config/db"); // Karena index.js ada di folder models, mundurnya cukup sekali saja
const Akun = require("./Akun");
const Profil = require("./Profil");
const Kandungan = require("./Kandungan");
const Ensiklopedia = require("./Ensiklopedia");
const Recycle = require("./Recycle");
const Forum = require("./Forum"); // Sesuaikan nama variabel agar sama dengan Controller
const Komentar = require("./Komentar");
const RiwayatPoin = require("./RiwayatPoin");

// -- RELATIONSHIPS (Sesuai Garis ERD) --

// 1. Akun & Profil (1:1)
Akun.hasOne(Profil, { foreignKey: "id_akun" });
Profil.belongsTo(Akun, { foreignKey: "id_akun" });

// 2. Profil & Forum (1:M)
Profil.hasMany(Forum, { foreignKey: "id_profil" });
Forum.belongsTo(Profil, { foreignKey: "id_profil" });

// 3. Forum & Komentar (1:M)
Forum.hasMany(Komentar, { foreignKey: "id_forum" }); // Pastikan di Komentar.js ada id_forum
Komentar.belongsTo(Forum, { foreignKey: "id_forum" });

// 4. Profil & Komentar (1:M)
Profil.hasMany(Komentar, { foreignKey: "id_profil" });
Komentar.belongsTo(Profil, { foreignKey: "id_profil" });

// 5. Profil & Recycle (1:M)
Profil.hasMany(Recycle, { foreignKey: "id_profil" });
Recycle.belongsTo(Profil, { foreignKey: "id_profil" });

// 6. Profil & RiwayatPoin (1:M)
Profil.hasMany(RiwayatPoin, { foreignKey: "id_profil" });
RiwayatPoin.belongsTo(Profil, { foreignKey: "id_profil" });

module.exports = {
  sequelize,
  Akun,
  Profil,
  Kandungan,
  Ensiklopedia,
  Recycle,
  Forum,
  Komentar,
  RiwayatPoin,
};
