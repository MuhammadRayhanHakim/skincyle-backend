const sequelize = require("../config/db");
const Akun = require("./Akun");
const Profil = require("./Profil");
const Kandungan = require("./Kandungan");
const Ensiklopedia = require("./Ensiklopedia");
const Recycle = require("./Recycle");
const Forum = require("./Forum");
const Komentar = require("./Komentar");
const RiwayatPoin = require("./RiwayatPoin");

// -- IMPORT MODEL BARU (STAKEHOLDER & REWARDS) --
const Stakeholder = require("./Stakeholder");
const Produk = require("./Produk");
const VoucherReward = require("./VoucherReward");
const RedeemTransaction = require("./RedeemTransaction");

// -- RELATIONSHIPS (Sesuai Garis ERD & Controller Logic) --

// 1. Akun & Profil (1:1)
Akun.hasOne(Profil, { foreignKey: "id_akun", onDelete: "CASCADE" });
Profil.belongsTo(Akun, { foreignKey: "id_akun" });

// 2. Profil & Forum (1:M)
Profil.hasMany(Forum, { foreignKey: "id_profil" });
Forum.belongsTo(Profil, { foreignKey: "id_profil" });

// 3. Forum & Komentar (1:M)
Forum.hasMany(Komentar, { foreignKey: "id_posting", onDelete: "CASCADE" });
Komentar.belongsTo(Forum, { foreignKey: "id_posting" });

// 4. Profil & Komentar (1:M)
Profil.hasMany(Komentar, { foreignKey: "id_profil" });
Komentar.belongsTo(Profil, { foreignKey: "id_profil" });

// 5. Profil & Recycle (1:M)
Profil.hasMany(Recycle, { foreignKey: "id_profil" });
Recycle.belongsTo(Profil, { foreignKey: "id_profil" });

// 6. Profil & RiwayatPoin (1:M)
Profil.hasMany(RiwayatPoin, { foreignKey: "id_profil" });
RiwayatPoin.belongsTo(Profil, { foreignKey: "id_profil" });

// -- RELASI BARU (LOGIKA BISNIS & STAKEHOLDER) --

// 7. Stakeholder & Produk (1:M)
// Satu brand partner memiliki banyak katalog produk
Stakeholder.hasMany(Produk, {
  foreignKey: "id_stakeholder",
  onDelete: "CASCADE",
});
Produk.belongsTo(Stakeholder, { foreignKey: "id_stakeholder" });

// 8. Stakeholder & VoucherReward (1:M)
// Satu brand partner menyediakan banyak pilihan voucher reward
Stakeholder.hasMany(VoucherReward, {
  foreignKey: "id_stakeholder",
  onDelete: "CASCADE",
});
VoucherReward.belongsTo(Stakeholder, { foreignKey: "id_stakeholder" });

// 9. Profil & RedeemTransaction (1:M)
// Satu profil melakukan banyak transaksi penukaran voucher
Profil.hasMany(RedeemTransaction, { foreignKey: "id_profil" });
RedeemTransaction.belongsTo(Profil, { foreignKey: "id_profil" });

// 10. VoucherReward & RedeemTransaction (1:M)
// Satu jenis voucher bisa ditukarkan oleh banyak user (tercatat di transaksi)
VoucherReward.hasMany(RedeemTransaction, { foreignKey: "id_voucher" });
RedeemTransaction.belongsTo(VoucherReward, { foreignKey: "id_voucher" });

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
  Stakeholder,
  Produk,
  VoucherReward,
  RedeemTransaction,
};
