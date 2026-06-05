// // const { Recycle, Profil, RiwayatSaldo, Notifikasi } = require("../models");
// // const sequelize = require("../config/db");

// // /**
// //  * 1. Ambil Semua Laporan Masuk untuk Dashboard Admin
// //  * Menampilkan seluruh daftar penjemputan sampah dari semua user
// //  */
// // exports.getAllLaporanRecycle = async (req, res) => {
// //   try {
// //     const data = await Recycle.findAll({
// //       include: [
// //         {
// //           model: Profil,
// //           as: "penulis_laporan",
// //           attributes: ["username", "foto_profil"],
// //         },
// //       ],
// //       order: [["createdAt", "DESC"]],
// //     });
// //     res.json({ status: "success", data });
// //   } catch (error) {
// //     console.error("Error Admin Fetch:", error);
// //     res.status(500).json({ status: "error", message: error.message });
// //   }
// // };

// // /**
// //  * 2. Verifikasi Laporan (Tombol Selesaikan Verifikasi)
// //  * Admin menyetujui penjemputan (Status: menunggu_verifikasi -> sedang_dijemput)
// //  */
// // exports.verifikasiDanCairkanSaldo = async (req, res) => {
// //   const t = await sequelize.transaction();
// //   try {
// //     const { id_laporan } = req.body;
// //     const id_admin = req.user.id_profil;

// //     const laporan = await Recycle.findByPk(id_laporan, { transaction: t });
// //     if (!laporan) {
// //       await t.rollback();
// //       return res
// //         .status(404)
// //         .json({ status: "error", message: "Laporan tidak ditemukan" });
// //     }

// //     // 1. Update status laporan menjadi sedang dijemput
// //     await laporan.update(
// //       { status_jemput: "sedang_dijemput" },
// //       { transaction: t },
// //     );

// //     // 🚀 SINKRONISASI LOG USER: Update baris riwayat_saldo awal milik user agar statusnya ikut berubah dinamis
// //     const logRiwayat = await RiwayatSaldo.findOne({
// //       where: { id_laporan: id_laporan },
// //       transaction: t,
// //     });

// //     if (logRiwayat) {
// //       await logRiwayat.update(
// //         { status: "sedang_dijemput" },
// //         { transaction: t },
// //       );
// //     }

// //     // 2. Kirim Notifikasi ke User
// //     await Notifikasi.create(
// //       {
// //         id_profil_penerima: laporan.id_profil,
// //         id_profil_pengirim: id_admin,
// //         id_posting: null,
// //         id_laporan: laporan.id_laporan,
// //         tipe: "penjemputan_diproses",
// //         pesan: "Kurir sedang menuju lokasi Anda untuk penjemputan sampah.",
// //         is_read: false,
// //         tanggal: new Date(),
// //       },
// //       { transaction: t },
// //     );

// //     await t.commit();
// //     res.json({
// //       status: "success",
// //       message:
// //         "Verifikasi berhasil! User telah dinotifikasi bahwa penjemputan sedang berlangsung.",
// //     });
// //   } catch (error) {
// //     await t.rollback();
// //     res.status(500).json({ status: "error", message: error.message });
// //   }
// // };

// // /**
// //  * 3. Tolak Laporan (Opsional)
// //  */
// // exports.tolakLaporanRecycle = async (req, res) => {
// //   try {
// //     const { id_laporan } = req.params;
// //     const id_admin = req.user.id_profil;

// //     const laporan = await Recycle.findByPk(id_laporan);
// //     if (!laporan)
// //       return res.status(404).json({ message: "Laporan tidak ditemukan" });

// //     await laporan.update({ status_jemput: "ditolak" });

// //     await Notifikasi.create({
// //       id_profil_penerima: laporan.id_profil,
// //       id_profil_pengirim: id_admin,
// //       tipe: "penjemputan_ditolak",
// //       pesan:
// //         "Maaf, laporan pengiriman sampah daur ulang Anda ditolak oleh admin.",
// //       is_read: false,
// //       tanggal: new Date(),
// //     });

// //     res.json({ status: "success", message: "Laporan telah ditolak." });
// //   } catch (error) {
// //     res.status(500).json({ status: "error", message: error.message });
// //   }
// // };

// // /**
// //  * 4. FUNGSI BARU: FINALISASI & KIRIM SALDO (DIKLIK DARI POPUP MODAL ADMIN)
// //  * 🚀 FIX MUTLAK ANTI-DOUBLE: Menimpa log penjemputan awal Rp 0 menjadi dana cair riil
// //  */
// // exports.finalisasiDanKirimSaldo = async (req, res) => {
// //   const t = await sequelize.transaction();

// //   try {
// //     const { id_laporan, saldo_final } = req.body;
// //     const id_admin = req.user.id_profil;

// //     if (!id_laporan || !saldo_final) {
// //       await t.rollback();
// //       return res.status(400).json({
// //         status: "error",
// //         message: "ID Laporan dan Jumlah Saldo Cair wajib dilampirkan.",
// //       });
// //     }

// //     const targetIdLaporan = parseInt(id_laporan);
// //     const nominalSaldoFinal = parseInt(saldo_final);

// //     // 1. Cari data laporan recycle
// //     const laporan = await Recycle.findByPk(targetIdLaporan, { transaction: t });
// //     if (!laporan) {
// //       await t.rollback();
// //       return res
// //         .status(404)
// //         .json({
// //           status: "error",
// //           message: "Laporan daur ulang tidak ditemukan.",
// //         });
// //     }

// //     if (laporan.status_jemput === "selesai") {
// //       await t.rollback();
// //       return res
// //         .status(400)
// //         .json({
// //           status: "error",
// //           message: "Laporan sudah selesai diproses sebelumnya.",
// //         });
// //     }

// //     const idUserPenerima = laporan.id_profil;

// //     // 2. Tambahkan saldo langsung ke tabel Profil Pengguna milik user
// //     const profilUser = await Profil.findByPk(idUserPenerima, {
// //       transaction: t,
// //     });
// //     if (!profilUser) {
// //       await t.rollback();
// //       return res
// //         .status(404)
// //         .json({
// //           status: "error",
// //           message: "Profil akun pengguna tidak ditemukan.",
// //         });
// //     }

// //     const saldoBaru = (profilUser.total_saldo || 0) + nominalSaldoFinal;
// //     await profilUser.update({ total_saldo: saldoBaru }, { transaction: t });

// //     // 🚀 3. FIX ANTI-GANDA: Cari log lama di riwayat_saldo bernilai Rp 0 untuk di-UPDATE (bukan .create baru!)
// //     const logRiwayatLama = await RiwayatSaldo.findOne({
// //       where: {
// //         id_laporan: targetIdLaporan,
// //         tipe_transaksi: "masuk",
// //       },
// //       transaction: t,
// //     });

// //     if (logRiwayatLama) {
// //       // Menimpa baris Rp 0 yang menggantung di perjalanan langsung menjadi Selesai dengan nominal saldo riil
// //       await logRiwayatLama.update(
// //         {
// //           status: "selesai",
// //           aktivitas: `Recycling: ${laporan.estimasi_berat} Sampah Skincare`,
// //           jumlah_saldo: nominalSaldoFinal,
// //           tanggal: new Date(),
// //         },
// //         { transaction: t },
// //       );
// //     } else {
// //       // Cadangan aman jika karena suatu pengujian log penjemputan awal tidak terdeteksi
// //       await RiwayatSaldo.create(
// //         {
// //           id_profil: idUserPenerima,
// //           id_laporan: targetIdLaporan,
// //           aktivitas: `Recycling: ${laporan.estimasi_berat} Sampah Skincare`,
// //           jumlah_saldo: nominalSaldoFinal,
// //           tipe_transaksi: "masuk",
// //           status: "selesai",
// //           tanggal: new Date(),
// //         },
// //         { transaction: t },
// //       );
// //     }

// //     // 4. Update data status penjemputan akhir di tabel recycle menjadi 'selesai'
// //     await laporan.update(
// //       {
// //         status_jemput: "selesai",
// //         saldo_cair: nominalSaldoFinal,
// //       },
// //       { transaction: t },
// //     );

// //     // 5. Kirim Notifikasi penutup ke user bahwa saldo sudah cair ke dompet
// //     await Notifikasi.create(
// //       {
// //         id_profil_penerima: idUserPenerima,
// //         id_profil_pengirim: id_admin,
// //         id_laporan: targetIdLaporan,
// //         tipe: "saldo_cair",
// //         pesan: `Proses daur ulang selesai! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah berhasil ditambahkan ke dompet akun Anda.`,
// //         is_read: false,
// //         tanggal: new Date(),
// //       },
// //       { transaction: t },
// //     );

// //     await t.commit();

// //     res.json({
// //       status: "success",
// //       message: `Berhasil menyerahkan sampah ke pengepul! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah ditransfer ke user ${profilUser.username}.`,
// //     });
// //   } catch (error) {
// //     await t.rollback();
// //     console.error("Error Finalisasi Daur Ulang:", error);
// //     res.status(500).json({ status: "error", message: error.message });
// //   }
// // };

// const {
//   Recycle,
//   Profil,
//   RiwayatSaldo,
//   Notifikasi,
//   Produk,
//   Kandungan,
//   sequelize,
// } = require("../models");
// const { Op } = require("sequelize");

// /**
//  * 1. Ambil Semua Laporan Masuk untuk Dashboard Admin
//  * Menampilkan seluruh daftar penjemputan sampah dari semua user
//  */
// exports.getAllLaporanRecycle = async (req, res) => {
//   try {
//     const data = await Recycle.findAll({
//       include: [
//         {
//           model: Profil,
//           as: "penulis_laporan",
//           attributes: ["username", "foto_profil"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });
//     res.json({ status: "success", data });
//   } catch (error) {
//     console.error("Error Admin Fetch:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// /**
//  * 2. Verifikasi Laporan (Tombol Selesaikan Verifikasi)
//  * Admin menyetujui penjemputan (Status: menunggu_verifikasi -> sedang_dijemput)
//  */
// exports.verifikasiDanCairkanSaldo = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { id_laporan } = req.body;
//     const id_admin = req.user.id_profil;

//     const laporan = await Recycle.findByPk(id_laporan, { transaction: t });
//     if (!laporan) {
//       await t.rollback();
//       return res
//         .status(404)
//         .json({ status: "error", message: "Laporan tidak ditemukan" });
//     }

//     // 1. Update status laporan menjadi sedang dijemput
//     await laporan.update(
//       { status_jemput: "sedang_dijemput" },
//       { transaction: t },
//     );

//     // 🚀 SINKRONISASI LOG USER: Update baris riwayat_saldo awal milik user agar statusnya ikut berubah dinamis
//     const logRiwayat = await RiwayatSaldo.findOne({
//       where: { id_laporan: id_laporan },
//       transaction: t,
//     });

//     if (logRiwayat) {
//       await logRiwayat.update(
//         { status: "sedang_dijemput" },
//         { transaction: t },
//       );
//     }

//     // 2. Kirim Notifikasi ke User
//     await Notifikasi.create(
//       {
//         id_profil_penerima: laporan.id_profil,
//         id_profil_pengirim: id_admin,
//         id_posting: null,
//         id_laporan: laporan.id_laporan,
//         tipe: "penjemputan_diproses",
//         pesan: "Kurir sedang menuju lokasi Anda untuk penjemputan sampah.",
//         is_read: false,
//         tanggal: new Date(),
//       },
//       { transaction: t },
//     );

//     await t.commit();
//     res.json({
//       status: "success",
//       message:
//         "Verifikasi berhasil! User telah dinotifikasi bahwa penjemputan sedang berlangsung.",
//     });
//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// /**
//  * 3. Tolak Laporan
//  */
// exports.tolakLaporanRecycle = async (req, res) => {
//   try {
//     const { id_laporan } = req.params;
//     const id_admin = req.user.id_profil;

//     const laporan = await Recycle.findByPk(id_laporan);
//     if (!laporan)
//       return res.status(404).json({ message: "Laporan tidak ditemukan" });

//     await laporan.update({ status_jemput: "ditolak" });

//     await Notifikasi.create({
//       id_profil_penerima: laporan.id_profil,
//       id_profil_pengirim: id_admin,
//       tipe: "penjemputan_ditolak",
//       pesan:
//         "Maaf, laporan pengiriman sampah daur ulang Anda ditolak oleh admin.",
//       is_read: false,
//       tanggal: new Date(),
//     });

//     res.json({ status: "success", message: "Laporan telah ditolak." });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// /**
//  * 4. FINALISASI & KIRIM SALDO (DIKLIK DARI POPUP MODAL ADMIN)
//  * 🚀 FIX MUTLAK ANTI-DOUBLE: Menimpa log penjemputan awal Rp 0 menjadi dana cair riil
//  */
// exports.finalisasiDanKirimSaldo = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { id_laporan, saldo_final } = req.body;
//     const id_admin = req.user.id_profil;

//     if (!id_laporan || !saldo_final) {
//       await t.rollback();
//       return res.status(400).json({
//         status: "error",
//         message: "ID Laporan dan Jumlah Saldo Cair wajib dilampirkan.",
//       });
//     }

//     const targetIdLaporan = parseInt(id_laporan);
//     const nominalSaldoFinal = parseInt(saldo_final);

//     const laporan = await Recycle.findByPk(targetIdLaporan, { transaction: t });
//     if (!laporan) {
//       await t.rollback();
//       return res.status(404).json({
//         status: "error",
//         message: "Laporan daur ulang tidak ditemukan.",
//       });
//     }

//     if (laporan.status_jemput === "selesai") {
//       await t.rollback();
//       return res.status(400).json({
//         status: "error",
//         message: "Laporan sudah selesai diproses sebelumnya.",
//       });
//     }

//     const idUserPenerima = laporan.id_profil;

//     const profilUser = await Profil.findByPk(idUserPenerima, {
//       transaction: t,
//     });
//     if (!profilUser) {
//       await t.rollback();
//       return res.status(404).json({
//         status: "error",
//         message: "Profil akun pengguna tidak ditemukan.",
//       });
//     }

//     const saldoBaru = (profilUser.total_saldo || 0) + nominalSaldoFinal;
//     await profilUser.update({ total_saldo: saldoBaru }, { transaction: t });

//     const logRiwayatLama = await RiwayatSaldo.findOne({
//       where: {
//         id_laporan: targetIdLaporan,
//         tipe_transaksi: "masuk",
//       },
//       transaction: t,
//     });

//     if (logRiwayatLama) {
//       await logRiwayatLama.update(
//         {
//           status: "selesai",
//           aktivitas: `Recycling: ${laporan.estimasi_berat} Sampah Skincare`,
//           jumlah_saldo: nominalSaldoFinal,
//           tanggal: new Date(),
//         },
//         { transaction: t },
//       );
//     } else {
//       await RiwayatSaldo.create(
//         {
//           id_profil: idUserPenerima,
//           id_laporan: targetIdLaporan,
//           aktivitas: `Recycling: ${laporan.estimasi_berat} Sampah Skincare`,
//           jumlah_saldo: nominalSaldoFinal,
//           tipe_transaksi: "masuk",
//           status: "selesai",
//           tanggal: new Date(),
//         },
//         { transaction: t },
//       );
//     }

//     await laporan.update(
//       {
//         status_jemput: "selesai",
//         saldo_cair: nominalSaldoFinal,
//       },
//       { transaction: t },
//     );

//     await Notifikasi.create(
//       {
//         id_profil_penerima: idUserPenerima,
//         id_profil_pengirim: id_admin,
//         id_laporan: targetIdLaporan,
//         tipe: "saldo_cair",
//         pesan: `Proses daur ulang selesai! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah berhasil ditambahkan ke dompet akun Anda.`,
//         is_read: false,
//         tanggal: new Date(),
//       },
//       { transaction: t },
//     );

//     await t.commit();

//     res.json({
//       status: "success",
//       message: `Berhasil menyerahkan sampah ke pengepul! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah ditransfer ke user ${profilUser.username}.`,
//     });
//   } catch (error) {
//     await t.rollback();
//     console.error("Error Finalisasi Daur Ulang:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// /**
//  * 5. DATA STATISTIK UNTUK DASHBOARD UTAMA ADMIN
//  */
// exports.getDashboardOverviewStats = async (req, res) => {
//   try {
//     const totalProduk = await Produk.count();

//     // 🌟 SEGMEN BARU: MENGHITUNG KATEGORI PRODUK SECARA DINAMIS (Serum, Facial Wash, dll.)
//     const kelompokKategori = await Produk.findAll({
//       attributes: [
//         "kategori",
//         [sequelize.fn("COUNT", sequelize.col("id_produk")), "jumlah"],
//       ],
//       group: ["kategori"],
//     });

//     let = {};

//     if (totalProduk > 0) {
//       kelompokKategori.forEach((item) => {
//         const namaKategori = item.getDataValue("kategori") || "Lainnya";
//         const jumlah = parseInt(item.getDataValue("jumlah") || 0);

//         // Menghitung persentase riil dari jenis produk
//         distribusiProduk[namaKategori] = Math.round(
//           (jumlah / totalProduk) * 100,
//         );
//       });
//     } else {
//       // FALLBACK MOCKUP: Jika database baru di-clear (0 produk), beri contoh porsi agar chart tidak hancur
//       distribusiProduk = {
//         Serum: 40,
//         "Facial Wash": 30,
//         Cleanser: 20,
//         Moisturizer: 10,
//       };
//     }

//     // Mengambil data metrics counter box atas
//     const kategoriUnik = await Produk.findAll({
//       attributes: [
//         [sequelize.fn("DISTINCT", sequelize.col("kategori")), "kategori"],
//       ],
//     });
//     const totalKategori = kategoriUnik.length === 0 ? 4 : kategoriUnik.length;
//     const totalOrders = await RiwayatSaldo.count({
//       where: { tipe_transaksi: "keluar" },
//     });
//     const orderPerluDiproses = await RiwayatSaldo.count({
//       where: { tipe_transaksi: "keluar", status: { [Op.not]: "selesai" } },
//     });
//     const totalBahan = await Kandungan.count();
//     const bahanAktifAman = await Kandungan.count({
//       where: { status_keamanan: "aman" },
//     });
//     const permintaanDaurUlangAktif = await Recycle.count({
//       where: {
//         status_jemput: { [Op.in]: ["menunggu_verifikasi", "sedang_dijemput"] },
//       },
//     });

//     // Query data untuk 5 baris tabel bawah dashboard
//     const laporanTerbaru = await Recycle.findAll({
//       limit: 5,
//       order: [["createdAt", "DESC"]],
//       include: [
//         { model: Profil, as: "penulis_laporan", attributes: ["username"] },
//       ],
//     });

//     const orderTerbaru = await RiwayatSaldo.findAll({
//       where: { tipe_transaksi: "keluar" },
//       limit: 5,
//       order: [["tanggal", "DESC"]],
//       include: [{ model: Profil, as: "pembeli", attributes: ["username"] }],
//     });

//     // 🔒 BAGIAN PERHITUNGAN AKTIVITAS MINGGUAN (TIDAK DIUBAH)
//     const hariLabels = [];
//     const datasetSampah = [];
//     const datasetOrder = [];
//     const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

//     for (let i = 6; i >= 0; i--) {
//       const d = new Date();
//       d.setDate(d.getDate() - i);
//       const startOfDay = new Date(d.setHours(0, 0, 0, 0));
//       const endOfDay = new Date(d.setHours(23, 59, 59, 999));
//       hariLabels.push(namaHari[startOfDay.getDay()]);

//       const countLaporan = await Recycle.count({
//         where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
//       });
//       datasetSampah.push(countLaporan * 2);

//       const countOrder = await RiwayatSaldo.count({
//         where: {
//           tipe_transaksi: "keluar",
//           tanggal: { [Op.between]: [startOfDay, endOfDay] },
//         },
//       });
//       datasetOrder.push(countOrder);
//     }

//     res.json({
//       status: "success",
//       data: {
//         cards: {
//           catalog: { produk: totalProduk, kategori: totalKategori },
//           sales: { total: totalOrders, pending: orderPerluDiproses },
//           materials: { total: totalBahan, aman: bahanAktifAman || 4 },
//           recycle: { aktif: permintaanDaurUlangAktif },
//         },
//         chartWeekly: {
//           labels: hariLabels,
//           sampah: datasetSampah,
//           order: datasetOrder,
//         },
//         distribusiProduk, // Data baru terkirim secara dinamis
//       },
//     });
//   } catch (error) {
//     console.error("Error Fetch Dashboard Overview Stats:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // Fungsi pembantu jika kategori terdeteksi kosong
// function kitchenSinkCategoryFix(len) {
//   return len === 0 ? 3 : len;
// }

// // Fungsi pembantu jika bahan aman kosong
// function boksBahanAmanFix(count) {
//   return count === 0 ? 4 : count;
// }

const {
  Recycle,
  Profil,
  RiwayatSaldo,
  Notifikasi,
  Produk,
  Kandungan,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

/**
 * 1. Ambil Semua Laporan Masuk untuk Dashboard Admin
 * Menampilkan seluruh daftar penjemputan sampah dari semua user
 */
exports.getAllLaporanRecycle = async (req, res) => {
  try {
    const data = await Recycle.findAll({
      include: [
        {
          model: Profil,
          as: "penulis_laporan",
          attributes: ["username", "foto_profil"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ status: "success", data });
  } catch (error) {
    console.error("Error Admin Fetch:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * 2. Verifikasi Laporan (Tombol Selesaikan Verifikasi)
 * Admin menyetujui penjemputan (Status: menunggu_verifikasi -> sedang_dijemput)
 */
exports.verifikasiDanCairkanSaldo = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_laporan } = req.body;
    const id_admin = req.user.id_profil;

    const laporan = await Recycle.findByPk(id_laporan, { transaction: t });
    if (!laporan) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Laporan tidak ditemukan" });
    }

    // 1. Update status laporan menjadi sedang dijemput
    await laporan.update(
      { status_jemput: "sedang_dijemput" },
      { transaction: t },
    );

    // SINKRONISASI LOG USER: Update baris riwayat_saldo awal milik user agar statusnya ikut berubah dinamis
    const logRiwayat = await RiwayatSaldo.findOne({
      where: { id_laporan: id_laporan },
      transaction: t,
    });

    if (logRiwayat) {
      await logRiwayat.update(
        { status: "sedang_dijemput" },
        { transaction: t },
      );
    }

    // 2. Kirim Notifikasi ke User
    await Notifikasi.create(
      {
        id_profil_penerima: laporan.id_profil,
        id_profil_pengirim: id_admin,
        id_posting: null,
        id_laporan: laporan.id_laporan,
        tipe: "penjemputan_diproses",
        pesan: "Kurir sedang menuju lokasi Anda untuk penjemputan sampah.",
        is_read: false,
        tanggal: new Date(),
      },
      { transaction: t },
    );

    await t.commit();
    res.json({
      status: "success",
      message:
        "Verifikasi berhasil! User telah dinotifikasi bahwa penjemputan sedang berlangsung.",
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * 3. Tolak Laporan
 */
exports.tolakLaporanRecycle = async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const id_admin = req.user.id_profil;

    const laporan = await Recycle.findByPk(id_laporan);
    if (!laporan)
      return res.status(404).json({ message: "Laporan tidak ditemukan" });

    await laporan.update({ status_jemput: "ditolak" });

    await Notifikasi.create({
      id_profil_penerima: laporan.id_profil,
      id_profil_pengirim: id_admin,
      tipe: "penjemputan_ditolak",
      pesan:
        "Maaf, laporan pengiriman sampah daur ulang Anda ditolak oleh admin.",
      is_read: false,
      tanggal: new Date(),
    });

    res.json({ status: "success", message: "Laporan telah ditolak." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * 4. FINALISASI & KIRIM SALDO (DIKLIK DARI POPUP MODAL ADMIN)
 * FIX MUTLAK ANTI-DOUBLE: Menimpa log penjemputan awal Rp 0 menjadi dana cair riil
 */
exports.finalisasiDanKirimSaldo = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id_laporan, saldo_final } = req.body;
    const id_admin = req.user.id_profil;

    if (!id_laporan || !saldo_final) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "ID Laporan dan Jumlah Saldo Cair wajib dilampirkan.",
      });
    }

    const targetIdLaporan = parseInt(id_laporan);
    const nominalSaldoFinal = parseInt(saldo_final);

    const laporan = await Recycle.findByPk(targetIdLaporan, { transaction: t });
    if (!laporan) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Laporan daur ulang tidak ditemukan.",
      });
    }

    if (laporan.status_jemput === "selesai") {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Laporan sudah selesai diproses sebelumnya.",
      });
    }

    const idUserPenerima = laporan.id_profil;

    const profilUser = await Profil.findByPk(idUserPenerima, {
      transaction: t,
    });
    if (!profilUser) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Profil akun pengguna tidak ditemukan.",
      });
    }

    const saldoBaru = (profilUser.total_saldo || 0) + nominalSaldoFinal;
    await profilUser.update({ total_saldo: saldoBaru }, { transaction: t });

    const logRiwayatLama = await RiwayatSaldo.findOne({
      where: {
        id_laporan: targetIdLaporan,
        tipe_transaksi: "masuk",
      },
      transaction: t,
    });

    if (logRiwayatLama) {
      await logRiwayatLama.update(
        {
          status: "selesai",
          aktivitas: `Recycling: ${laporan.estimasi_berat} Sampah Skincare`,
          jumlah_saldo: nominalSaldoFinal,
          tanggal: new Date(),
        },
        { transaction: t },
      );
    } else {
      await RiwayatSaldo.create(
        {
          id_profil: idUserPenerima,
          id_laporan: targetIdLaporan,
          aktivitas: `Recycling: ${laporan.estimasi_berat} Sampah Skincare`,
          jumlah_saldo: nominalSaldoFinal,
          tipe_transaksi: "masuk",
          status: "selesai",
          tanggal: new Date(),
        },
        { transaction: t },
      );
    }

    await laporan.update(
      {
        status_jemput: "selesai",
        saldo_cair: nominalSaldoFinal,
      },
      { transaction: t },
    );

    await Notifikasi.create(
      {
        id_profil_penerima: idUserPenerima,
        id_profil_pengirim: id_admin,
        id_laporan: targetIdLaporan,
        tipe: "saldo_cair",
        pesan: `Proses daur ulang selesai! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah berhasil ditambahkan ke dompet akun Anda.`,
        is_read: false,
        tanggal: new Date(),
      },
      { transaction: t },
    );

    await t.commit();

    res.json({
      status: "success",
      message: `Berhasil menyerahkan sampah ke pengepul! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah ditransfer ke user ${profilUser.username}.`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error Finalisasi Daur Ulang:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getDashboardOverviewStats = async (req, res) => {
  try {
    const totalProduk = await Produk.count();
    
    // MENGHITUNG KATEGORI PRODUK SECARA DINAMIS
    const kelompokKategori = await Produk.findAll({
      attributes: [
        "kategori",
        [sequelize.fn("COUNT", sequelize.col("id_produk")), "jumlah"],
      ],
      group: ["kategori"],
    });

    let  = {};

    if (totalProduk > 0) {
      kelompokKategori.forEach((item) => {
        const namaKategori = item.getDataValue("kategori") || "Lainnya";
        const jumlah = parseInt(item.getDataValue("jumlah") || 0);
        distribusiProduk[namaKategori] = Math.round((jumlah / totalProduk) * 100);
      });
    } else {
      distribusiProduk = {};
    }

    // Mengambil data metrics counter box atas
    const kategoriUnik = await Produk.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("kategori")), "kategori"],
      ],
    });
    
    const totalKategori = kitchenSinkCategoryFix(kategoriUnik.length);
    const totalOrders = await RiwayatSaldo.count({ where: { tipe_transaksi: "keluar" } });
    const orderPerluDiproses = await RiwayatSaldo.count({
      where: { tipe_transaksi: "keluar", status: { [Op.not]: "selesai" } },
    });
    
    const totalBahan = await Kandungan.count();
    const bahanAktifAman = await Kandungan.count(); 

    // 🌟 FIX UTAMA: Menambahkan kembali deklarasi variabel permintaanDaurUlangAktif yang hilang
    const permintaanDaurUlangAktif = await Recycle.count({
      where: {
        status_jemput: { [Op.in]: ["menunggu_verifikasi", "sedang_dijemput"] },
      },
    });

    // Query data untuk daftar tabel bawah dashboard
    const laporanTerbaru = await Recycle.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: Profil, as: "penulis_laporan", attributes: ["username"] }],
    });

    const orderTerbaru = await RiwayatSaldo.findAll({
      where: { tipe_transaksi: "keluar" },
      limit: 5,
      order: [["tanggal", "DESC"]],
      include: [{ model: Profil, as: "pembeli", attributes: ["username"] }],
    });

    // BAGIAN PERHITUNGAN AKTIVITAS MINGGUAN (TIDAK DIUBAH)
    const hariLabels = [];
    const datasetSampah = [];
    const datasetOrder = [];
    const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      hariLabels.push(namaHari[startOfDay.getDay()]);

      const countLaporan = await Recycle.count({
        where: { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
      });
      datasetSampah.push(countLaporan * 2);

      const countOrder = await RiwayatSaldo.count({
        where: {
          tipe_transaksi: "keluar",
          tanggal: { [Op.between]: [startOfDay, endOfDay] },
        },
      });
      datasetOrder.push(countOrder);
    }

    res.json({
      status: "success",
      data: {
        cards: {
          catalog: { produk: totalProduk, kategori: totalKategori },
          sales: { total: totalOrders, pending: orderPerluDiproses },
          materials: { total: totalBahan, aman: boksBahanAmanFix(bahanAktifAman) },
          recycle: { aktif: permintaanDaurUlangAktif }, // 🌟 Variabel sekarang terbaca dengan aman
        },
        chartWeekly: {
          labels: hariLabels,
          sampah: datasetSampah,
          order: datasetOrder,
        },
        distribusiProduk,
        laporanTerbaru,
        orderTerbaru
      },
    });
  } catch (error) {
    console.error("Error Fetch Dashboard Overview Stats:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Fungsi pembantu jika kategori terdeteksi kosong
function kitchenSinkCategoryFix(len) {
  return len === 0 ? 0 : len;
}

// Fungsi pembantu jika bahan aman kosong
function boksBahanAmanFix(count) {
  return count === 0 ? 0 : count;
}
