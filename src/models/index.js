const sequelize = require("../config/db");
const Akun = require("./Akun");
const Profil = require("./Profil");
const Kandungan = require("./Kandungan");
const Ensiklopedia = require("./Ensiklopedia");
const Recycle = require("./Recycle");
const Forum = require("./Forum");
const Komentar = require("./Komentar");
const RiwayatSaldo = require("./RiwayatSaldo");
const Stakeholder = require("./Stakeholder");
const Produk = require("./Produk");
const ForumLike = require("./ForumLike");
const Notifikasi = require("./Notifikasi"); // 1. Import Model Notifikasi

// -- RELATIONSHIPS --

// 1. Akun & Profil (1:1)
Akun.hasOne(Profil, { foreignKey: "id_akun", onDelete: "CASCADE" });
Profil.belongsTo(Akun, { foreignKey: "id_akun" });

// 2. Profil & Forum (1:M)
Profil.hasMany(Forum, { foreignKey: "id_profil", as: "postingan" });
Forum.belongsTo(Profil, { foreignKey: "id_profil", as: "penulis" });

// 3. Forum & Komentar (1:M)
Forum.hasMany(Komentar, {
  foreignKey: "id_posting",
  as: "komentar",
  onDelete: "CASCADE",
});
Komentar.belongsTo(Forum, { foreignKey: "id_posting" });

// 4. Profil & Komentar (1:M)
Profil.hasMany(Komentar, { foreignKey: "id_profil", as: "balasan_user" });
Komentar.belongsTo(Profil, { foreignKey: "id_profil", as: "pemberi_komentar" });

// 5. Forum & ForumLike (1:M & 1:M)
Forum.hasMany(ForumLike, {
  foreignKey: "id_posting",
  as: "likes",
  onDelete: "CASCADE",
});
ForumLike.belongsTo(Forum, { foreignKey: "id_posting" });

Profil.hasMany(ForumLike, { foreignKey: "id_profil", as: "suka_postingan" });
ForumLike.belongsTo(Profil, { foreignKey: "id_profil" });

// 6. Profil & Recycle (1:M)
Profil.hasMany(Recycle, {
  foreignKey: "id_profil",
  as: "aktivitas_daur_ulang",
});
Recycle.belongsTo(Profil, { foreignKey: "id_profil" });

// 7. Profil & RiwayatSaldo (1:M)
Profil.hasMany(RiwayatSaldo, {
  foreignKey: "id_profil",
  as: "riwayat_transaksi",
});
RiwayatSaldo.belongsTo(Profil, { foreignKey: "id_profil" });

// 8. Stakeholder & Produk (1:M)
Stakeholder.hasMany(Produk, {
  foreignKey: "id_stakeholder",
  as: "daftar_produk",
  onDelete: "CASCADE",
});
Produk.belongsTo(Stakeholder, { foreignKey: "id_stakeholder" });

// 9. RELASI NOTIFIKASI (BARU)
// Relasi ke Profil Penerima (Siapa yang mendapat notif)
Profil.hasMany(Notifikasi, {
  foreignKey: "id_profil_penerima",
  as: "notif_masuk",
});
Notifikasi.belongsTo(Profil, {
  foreignKey: "id_profil_penerima",
  as: "penerima",
});

// Relasi ke Profil Pengirim (Siapa yang melakukan aksi like/komen)
Profil.hasMany(Notifikasi, {
  foreignKey: "id_profil_pengirim",
  as: "notif_keluar",
});
Notifikasi.belongsTo(Profil, {
  foreignKey: "id_profil_pengirim",
  as: "pengirim",
});

// Relasi ke Forum (Notifikasi merujuk ke postingan mana)
Forum.hasMany(Notifikasi, { foreignKey: "id_posting", onDelete: "CASCADE" });
Notifikasi.belongsTo(Forum, { foreignKey: "id_posting" });

module.exports = {
  sequelize,
  Akun,
  Profil,
  Kandungan,
  Ensiklopedia,
  Recycle,
  Forum,
  Komentar,
  RiwayatSaldo,
  Stakeholder,
  Produk,
  ForumLike,
  Notifikasi, // 2. Export Model Notifikasi
};
