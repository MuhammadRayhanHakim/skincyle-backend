// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const RiwayatSaldo = sequelize.define(
//   "riwayat_saldo",
//   {
//     id_riwayat: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     id_profil: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     // --- TAMBAHKAN KOLOM HUBUNGAN INI (PENTING) ---
//     id_laporan: {
//       type: DataTypes.INTEGER,
//       allowNull: true, // Diisi ID laporan daur ulang jika tipenya saldo masuk hasil recycle
//     },
//     aktivitas: {
//       type: DataTypes.STRING,
//       allowNull: false, // Menjamin deskripsi aktivitas tidak boleh kosong
//     }, // Contoh: "Recycling: 1.2kg Glass Jars"
//     jumlah_saldo: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     }, // Nilai dalam Rupiah
//     tipe_transaksi: {
//       type: DataTypes.ENUM("masuk", "keluar"),
//       defaultValue: "masuk",
//     }, // 'masuk' untuk recycle, 'keluar' untuk redeem voucher
//     tanggal: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     freezeTableName: true, // Menjaga nama tabel di database tetap 'riwayat_saldo'
//     timestamps: false,
//   },
// );

// module.exports = RiwayatSaldo;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RiwayatSaldo = sequelize.define(
  "riwayat_saldo",
  {
    id_riwayat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_profil: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // --- KOLOM HUBUNGAN DAUR ULANG (TETAP DIJAGA UTUH & TIDAK BERUBAH) ---
    id_laporan: {
      type: DataTypes.INTEGER,
      allowNull: true, // Diisi ID laporan daur ulang jika tipenya saldo masuk hasil recycle
    },
    aktivitas: {
      type: DataTypes.STRING,
      allowNull: false, // Menjamin deskripsi aktivitas tidak boleh kosong
    }, // Contoh: "Recycling: 1.2kg Glass Jars" atau "Belanja: Potongan Saldo..."
    jumlah_saldo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }, // Nilai dalam Rupiah (Positif jika masuk, Negatif jika keluar belanja)
    tipe_transaksi: {
      type: DataTypes.ENUM("masuk", "keluar"),
      defaultValue: "masuk",
    }, // 'masuk' untuk recycle, 'keluar' untuk belanja produk kosmetik

    // 🌟 TAMBAHKAN KOLOM STATUS INI UNTUK MENGUNCI TRACKING BELANJA & DAUR ULANG
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "PENDING", // Menjamin default awal bernilai huruf besar PENDING saat user baru checkout
    },

    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true, // Menjaga nama tabel di database tetap 'riwayat_saldo'
    timestamps: false,
  },
);

module.exports = RiwayatSaldo;
