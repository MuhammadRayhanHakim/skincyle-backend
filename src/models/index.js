// // const sequelize = require("../config/db");
// // const Akun = require("./Akun");
// // const Profil = require("./Profil");
// // const Kandungan = require("./Kandungan");
// // const Ensiklopedia = require("./Ensiklopedia");
// // const Recycle = require("./Recycle");
// // const Forum = require("./Forum");
// // const Komentar = require("./Komentar");
// // const RiwayatSaldo = require("./RiwayatSaldo");
// // const Stakeholder = require("./Stakeholder");
// // const Produk = require("./Produk");
// // const ForumLike = require("./ForumLike");
// // const Notifikasi = require("./Notifikasi");
// // const Keranjang = require("./Keranjang");

// // // =========================================================================
// // // ── ⚙️ ASOSIASI / RELATIONSHIPS MODEL DATABASE
// // // =========================================================================

// // // 1. Akun & Profil (1:1)
// // Akun.hasOne(Profil, { foreignKey: "id_akun", onDelete: "CASCADE" });
// // Profil.belongsTo(Akun, { foreignKey: "id_akun" });

// // // 2. Profil & Forum (1:M)
// // Profil.hasMany(Forum, { foreignKey: "id_profil", as: "postingan" });
// // Forum.belongsTo(Profil, { foreignKey: "id_profil", as: "penulis" });

// // // 3. Forum & Komentar (1:M)
// // Forum.hasMany(Komentar, {
// //   foreignKey: "id_posting",
// //   as: "komentar",
// //   onDelete: "CASCADE",
// // });
// // Komentar.belongsTo(Forum, { foreignKey: "id_posting" });

// // // 4. Profil & Komentar (1:M)
// // Profil.hasMany(Komentar, { foreignKey: "id_profil", as: "balasan_user" });
// // Komentar.belongsTo(Profil, { foreignKey: "id_profil", as: "pemberi_komentar" });

// // // 5. Forum & ForumLike (1:M)
// // // 🛠️ PERBAIKAN: Potongan teks 'animate-pulse' yang merusak sintaks di baris ini sudah dihapus bersih
// // Forum.hasMany(ForumLike, {
// //   foreignKey: "id_posting",
// //   as: "likes",
// //   onDelete: "CASCADE",
// // });
// // ForumLike.belongsTo(Forum, { foreignKey: "id_posting" });

// // Profil.hasMany(ForumLike, { foreignKey: "id_profil", as: "suka_postingan" });
// // ForumLike.belongsTo(Profil, { foreignKey: "id_profil" });

// // // 6. Profil & Recycle / Laporan Daur Ulang (1:M)
// // Profil.hasMany(Recycle, {
// //   foreignKey: "id_profil",
// //   as: "aktivitas_daur_ulang",
// // });
// // Recycle.belongsTo(Profil, {
// //   foreignKey: "id_profil",
// //   as: "penulis_laporan",
// // });

// // // 7. Profil & RiwayatSaldo (1:M)
// // Profil.hasMany(RiwayatSaldo, {
// //   foreignKey: "id_profil",
// //   as: "riwayat_transaksi",
// // });

// // // 🚀 FIX RELASI: Menambahkan alias 'pembeli' agar bersesuaian dengan query include controller admin
// // RiwayatSaldo.belongsTo(Profil, {
// //   foreignKey: "id_profil",
// //   as: "pembeli",
// // });

// // // 8. RELASI ANTARA RECYCLE & RIWAYAT SALDO (1:M)
// // // Menghubungkan secara dinamis pelacakan sampah lingkungan dengan log keuangan dompet user
// // Recycle.hasMany(RiwayatSaldo, {
// //   foreignKey: "id_laporan",
// //   as: "transaksi_saldo_laporan",
// // });
// // RiwayatSaldo.belongsTo(Recycle, {
// //   foreignKey: "id_laporan",
// //   as: "detail_laporan",
// // });

// // // 9. Stakeholder & Produk (1:M)
// // Stakeholder.hasMany(Produk, {
// //   foreignKey: "id_stakeholder",
// //   as: "daftar_produk",
// //   onDelete: "CASCADE",
// // });
// // Produk.belongsTo(Stakeholder, { foreignKey: "id_stakeholder" });

// // // 10. RELASI NOTIFIKASI SYSTEM (Penerima & Pengirim)
// // Profil.hasMany(Notifikasi, {
// //   foreignKey: "id_profil_penerima",
// //   as: "notif_masuk",
// // });
// // Notifikasi.belongsTo(Profil, {
// //   foreignKey: "id_profil_penerima",
// //   as: "penerima",
// // });

// // Profil.hasMany(Notifikasi, {
// //   foreignKey: "id_profil_pengirim",
// //   as: "notif_keluar",
// // });
// // Notifikasi.belongsTo(Profil, {
// //   foreignKey: "id_profil_pengirim",
// //   as: "pengirim",
// // });

// // Forum.hasMany(Notifikasi, { foreignKey: "id_posting", onDelete: "CASCADE" });
// // Notifikasi.belongsTo(Forum, { foreignKey: "id_posting" });

// // // =========================================================================
// // // ── 🚀 EKSPOR MODEL TERINTEGRASI
// // // =========================================================================
// // module.exports = {
// //   sequelize,
// //   Akun,
// //   Profil,
// //   Kandungan,
// //   Ensiklopedia,
// //   Recycle,
// //   Forum,
// //   Komentar,
// //   RiwayatSaldo,
// //   Stakeholder,
// //   Produk,
// //   ForumLike,
// //   Notifikasi,
// //   Keranjang,
// // };

// const sequelize = require("../config/db");
// const Akun = require("./Akun");
// const Profil = require("./Profil");
// const Kandungan = require("./Kandungan");
// const Ensiklopedia = require("./Ensiklopedia");
// const Recycle = require("./Recycle");
// const Forum = require("./Forum");
// const Komentar = require("./Komentar");
// const RiwayatSaldo = require("./RiwayatSaldo");
// const Stakeholder = require("./Stakeholder");
// const Produk = require("./Produk");
// const ForumLike = require("./ForumLike");
// const Notifikasi = require("./Notifikasi");
// const Keranjang = require("./Keranjang");
// const TransaksiBelanja = require("./TransaksiBelanja"); // 🚀 Model Baru

// // =========================================================================
// // ── ⚙️ ASOSIASI / RELATIONSHIPS MODEL DATABASE
// // =========================================================================

// Akun.hasOne(Profil, { foreignKey: "id_akun", onDelete: "CASCADE" });
// Profil.belongsTo(Akun, { foreignKey: "id_akun" });

// Profil.hasMany(Forum, { foreignKey: "id_profil", as: "postingan" });
// Forum.belongsTo(Profil, { foreignKey: "id_profil", as: "penulis" });

// Forum.hasMany(Komentar, {
//   foreignKey: "id_posting",
//   as: "komentar",
//   onDelete: "CASCADE",
// });
// Komentar.belongsTo(Forum, { foreignKey: "id_posting" });

// Profil.hasMany(Komentar, { foreignKey: "id_profil", as: "balasan_user" });
// Komentar.belongsTo(Profil, { foreignKey: "id_profil", as: "pemberi_komentar" });

// Forum.hasMany(ForumLike, {
//   foreignKey: "id_posting",
//   as: "likes",
//   onDelete: "CASCADE",
// });
// ForumLike.belongsTo(Forum, { foreignKey: "id_posting" });

// Profil.hasMany(ForumLike, { foreignKey: "id_profil", as: "suka_postingan" });
// ForumLike.belongsTo(Profil, { foreignKey: "id_profil" });

// Profil.hasMany(Recycle, {
//   foreignKey: "id_profil",
//   as: "aktivitas_daur_ulang",
// });
// Recycle.belongsTo(Profil, { foreignKey: "id_profil", as: "penulis_laporan" });

// Profil.hasMany(RiwayatSaldo, {
//   foreignKey: "id_profil",
//   as: "riwayat_transaksi",
// });
// RiwayatSaldo.belongsTo(Profil, { foreignKey: "id_profil", as: "pembeli" });

// Recycle.hasMany(RiwayatSaldo, {
//   foreignKey: "id_laporan",
//   as: "transaksi_saldo_laporan",
// });
// RiwayatSaldo.belongsTo(Recycle, {
//   foreignKey: "id_laporan",
//   as: "detail_laporan",
// });

// // 🚀 RELASI BARU: Hubungkan RiwayatSaldo dengan rincian data TransaksiBelanja (1:1)
// RiwayatSaldo.hasOne(TransaksiBelanja, {
//   foreignKey: "id_riwayat",
//   as: "rincian_pengiriman",
//   onDelete: "CASCADE",
// });
// TransaksiBelanja.belongsTo(RiwayatSaldo, { foreignKey: "id_riwayat" });

// Stakeholder.hasMany(Produk, {
//   foreignKey: "id_stakeholder",
//   as: "daftar_produk",
//   onDelete: "CASCADE",
// });
// Produk.belongsTo(Stakeholder, { foreignKey: "id_stakeholder" });

// Profil.hasMany(Notifikasi, {
//   foreignKey: "id_profil_penerima",
//   as: "notif_masuk",
// });
// Notifikasi.belongsTo(Profil, {
//   foreignKey: "id_profil_penerima",
//   as: "penerima",
// });

// Profil.hasMany(Notifikasi, {
//   foreignKey: "id_profil_pengirim",
//   as: "notif_keluar",
// });
// Notifikasi.belongsTo(Profil, {
//   foreignKey: "id_profil_pengirim",
//   as: "pengirim",
// });

// Forum.hasMany(Notifikasi, { foreignKey: "id_posting", onDelete: "CASCADE" });
// Notifikasi.belongsTo(Forum, { foreignKey: "id_posting" });

// module.exports = {
//   sequelize,
//   Akun,
//   Profil,
//   Kandungan,
//   Ensiklopedia,
//   Recycle,
//   Forum,
//   Komentar,
//   RiwayatSaldo,
//   Stakeholder,
//   Produk,
//   ForumLike,
//   Notifikasi,
//   Keranjang,
//   TransaksiBelanja,
// };

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
const Notifikasi = require("./Notifikasi");
const Keranjang = require("./Keranjang");
const TransaksiBelanja = require("./TransaksiBelanja");

// =========================================================================
// ── ⚙️ ASOSIASI / RELATIONSHIPS MODEL DATABASE
// =========================================================================

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

// 5. Forum & ForumLike (1:M)
Forum.hasMany(ForumLike, {
  foreignKey: "id_posting",
  as: "likes",
  onDelete: "CASCADE",
});
ForumLike.belongsTo(Forum, { foreignKey: "id_posting" });

Profil.hasMany(ForumLike, { foreignKey: "id_profil", as: "suka_postingan" });
ForumLike.belongsTo(Profil, { foreignKey: "id_profil" });

// 6. Profil & Recycle / Laporan Daur Ulang (1:M)
Profil.hasMany(Recycle, {
  foreignKey: "id_profil",
  as: "aktivitas_daur_ulang",
});
Recycle.belongsTo(Profil, { foreignKey: "id_profil", as: "penulis_laporan" });

// 7. Profil & RiwayatSaldo (1:M)
Profil.hasMany(RiwayatSaldo, {
  foreignKey: "id_profil",
  as: "riwayat_transaksi",
});
RiwayatSaldo.belongsTo(Profil, { foreignKey: "id_profil", as: "pembeli" });

// 8. Recycle & RiwayatSaldo (1:M)
Recycle.hasMany(RiwayatSaldo, {
  foreignKey: "id_laporan",
  as: "transaksi_saldo_laporan",
});
RiwayatSaldo.belongsTo(Recycle, {
  foreignKey: "id_laporan",
  as: "detail_laporan",
});

// 9. RiwayatSaldo & TransaksiBelanja (1:1)
RiwayatSaldo.hasOne(TransaksiBelanja, {
  foreignKey: "id_riwayat",
  as: "rincian_pengiriman",
  onDelete: "CASCADE",
});
TransaksiBelanja.belongsTo(RiwayatSaldo, { foreignKey: "id_riwayat" });

// 10. Stakeholder & Produk (1:M)
Stakeholder.hasMany(Produk, {
  foreignKey: "id_stakeholder",
  as: "daftar_produk",
  onDelete: "CASCADE",
});
Produk.belongsTo(Stakeholder, { foreignKey: "id_stakeholder" });

// 11. Relasi Notifikasi System (Penerima & Pengirim)
Profil.hasMany(Notifikasi, {
  foreignKey: "id_profil_penerima",
  as: "notif_masuk",
});
Notifikasi.belongsTo(Profil, {
  foreignKey: "id_profil_penerima",
  as: "penerima",
});

Profil.hasMany(Notifikasi, {
  foreignKey: "id_profil_pengirim",
  as: "notif_keluar",
});
Notifikasi.belongsTo(Profil, {
  foreignKey: "id_profil_pengirim",
  as: "pengirim",
});

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
  Notifikasi,
  Keranjang,
  TransaksiBelanja,
};
