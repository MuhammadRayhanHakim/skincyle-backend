// // const { Recycle, Profil, RiwayatSaldo } = require("../models");

// // exports.verifikasiDanCairkanSaldo = async (req, res) => {
// //   try {
// //     const { id_laporan, saldo_final } = req.body;

// //     // 1. Cari data laporan recycle
// //     const laporan = await Recycle.findByPk(id_laporan);
// //     if (!laporan) {
// //       return res
// //         .status(404)
// //         .json({ status: "error", message: "Laporan tidak ditemukan" });
// //     }

// //     if (laporan.status_jemput === "selesai") {
// //       return res.status(400).json({
// //         status: "error",
// //         message: "Laporan sudah pernah diverifikasi",
// //       });
// //     }

// //     // 2. Update saldo di Profil User
// //     const profil = await Profil.findByPk(laporan.id_profil);
// //     if (!profil) {
// //       return res
// //         .status(404)
// //         .json({ status: "error", message: "Profil pengguna tidak ditemukan" });
// //     }

// //     // Update saldo user
// //     await profil.update({
// //       total_saldo: (profil.total_saldo || 0) + saldo_final,
// //     });

// //     // 3. Catat ke Riwayat Saldo (LOGIKA BARU)
// //     await RiwayatSaldo.create({
// //       id_profil: laporan.id_profil,
// //       aktivitas: `Pencairan Saldo Recycle (ID Laporan: #${id_laporan})`,
// //       jumlah_saldo: saldo_final,
// //       tipe_transaksi: "masuk",
// //       tanggal: new Date(),
// //     });

// //     // 4. Update status laporan di tabel recycle
// //     await laporan.update({
// //       status_jemput: "selesai",
// //       saldo_cair: saldo_final,
// //     });

// //     res.json({
// //       status: "success",
// //       message: `Berhasil! Saldo Rp${saldo_final} telah dikirim ke user ${profil.username}`,
// //       data: {
// //         id_laporan: id_laporan,
// //         saldo_masuk: saldo_final,
// //         total_saldo_sekarang: profil.total_saldo,
// //       },
// //     });
// //   } catch (error) {
// //     res.status(500).json({ status: "error", message: error.message });
// //   }
// // };

// const {
//   Recycle,
//   Profil,
//   RiwayatSaldo,
//   Notifikasi,
//   sequelize,
// } = require("../models");

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
//           // HAPUS "email" karena tidak ada di tabel profil_pengguna
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
//  * 2. Verifikasi Laporan & Cairkan Saldo
//  * Admin menyetujui penjemputan, menambah saldo user, dan mengirim notifikasi
//  */
// // src/controllers/adminController.js
// exports.verifikasiDanCairkanSaldo = async (req, res) => {
//   try {
//     const { id_laporan } = req.body;
//     const id_admin = req.user.id_profil; // Dari authMiddleware [cite: 21]

//     const laporan = await Recycle.findByPk(id_laporan);
//     if (!laporan)
//       return res
//         .status(404)
//         .json({ status: "error", message: "Laporan tidak ditemukan" });

//     // 1. Update status laporan menjadi sedang dijemput
//     await laporan.update({ status_jemput: "sedang_dijemput" });

//     // 2. Kirim Notifikasi ke User [cite: 29]
//     await Notifikasi.create({
//       id_profil_penerima: laporan.id_profil, //
//       id_profil_pengirim: id_admin, //
//       id_posting: null, // Berikan null secara eksplisit
//       id_laporan: laporan.id_laporan,
//       tipe: "penjemputan_diproses",
//       pesan: "Kurir sedang menuju lokasi Anda untuk penjemputan sampah.",
//       is_read: false, //
//       tanggal: new Date(), //
//     });

//     res.json({
//       status: "success",
//       message:
//         "Verifikasi berhasil! User telah dinotifikasi bahwa penjemputan sedang berlangsung.",
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// /**
//  * 3. Tolak Laporan (Opsional)
//  * Jika sampah tidak sesuai kriteria saat dijemput
//  */
// exports.tolakLaporanRecycle = async (req, res) => {
//   try {
//     const { id_laporan } = req.params;
//     const id_admin = req.user.id_profil;

//     const laporan = await Recycle.findByPk(id_laporan);
//     if (!laporan)
//       return res.status(404).json({ message: "Laporan tidak ditemukan" });

//     await laporan.update({ status_jemput: "ditolak" });

//     // Kirim notifikasi penolakan ke user
//     await Notifikasi.create({
//       id_profil_penerima: laporan.id_profil,
//       id_profil_pengirim: id_admin,
//       tipe: "penjemputan_ditolak",
//       is_read: false,
//       tanggal: new Date(),
//     });

//     res.json({ status: "success", message: "Laporan telah ditolak." });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const {
  Recycle,
  Profil,
  RiwayatSaldo,
  Notifikasi,
  sequelize,
} = require("../models");

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
  try {
    const { id_laporan } = req.body;
    const id_admin = req.user.id_profil;

    const laporan = await Recycle.findByPk(id_laporan);
    if (!laporan)
      return res
        .status(404)
        .json({ status: "error", message: "Laporan tidak ditemukan" });

    // 1. Update status laporan menjadi sedang dijemput
    await laporan.update({ status_jemput: "sedang_dijemput" });

    // 2. Kirim Notifikasi ke User
    await Notifikasi.create({
      id_profil_penerima: laporan.id_profil,
      id_profil_pengirim: id_admin,
      id_posting: null,
      id_laporan: laporan.id_laporan,
      tipe: "penjemputan_diproses",
      pesan: "Kurir sedang menuju lokasi Anda untuk penjemputan sampah.",
      is_read: false,
      tanggal: new Date(),
    });

    res.json({
      status: "success",
      message:
        "Verifikasi berhasil! User telah dinotifikasi bahwa penjemputan sedang berlangsung.",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * 3. Tolak Laporan (Opsional)
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
      is_read: false,
      tanggal: new Date(),
    });

    res.json({ status: "success", message: "Laporan telah ditolak." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * =========================================================================
 * 4. FUNGSI BARU: FINALISASI & KIRIM SALDO (DIKILIK DARI POPUP MODAL ADMIN)
 * Mengubah status: sedang_dijemput -> selesai, lalu mentransfer saldo riil
 * =========================================================================
 */
exports.finalisasiDanKirimSaldo = async (req, res) => {
  // Menggunakan database transaction agar eksekusi data aman dan sinkron
  const t = await sequelize.transaction();

  try {
    // Menangkap parameter 'saldo_final' agar sinkron dengan form popup modal frontend Anda
    const { id_laporan, saldo_final } = req.body;
    const id_admin = req.user.id_profil;

    if (!id_laporan || !saldo_final) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "ID Laporan dan Jumlah Saldo Cair wajib dilampirkan.",
      });
    }

    // 1. Cari data laporan recycle
    const laporan = await Recycle.findByPk(id_laporan);
    if (!laporan) {
      await t.rollback();
      return res
        .status(404)
        .json({
          status: "error",
          message: "Laporan daur ulang tidak ditemukan.",
        });
    }

    if (laporan.status_jemput === "selesai") {
      await t.rollback();
      return res
        .status(400)
        .json({
          status: "error",
          message: "Laporan sudah selesai diproses sebelumnya.",
        });
    }

    const idUserPenerima = laporan.id_profil;

    // 2. Tambahkan saldo langsung ke tabel Profil Pengguna milik user
    const profilUser = await Profil.findByPk(idUserPenerima);
    if (!profilUser) {
      await t.rollback();
      return res
        .status(404)
        .json({
          status: "error",
          message: "Profil akun pengguna tidak ditemukan.",
        });
    }

    await Profil.update(
      { total_saldo: (profilUser.total_saldo || 0) + parseInt(saldo_final) },
      { where: { id_profil: idUserPenerima }, transaction: t },
    );

    // 3. Catat mutasi finansial ke tabel `riwayat_saldo` menggunakan FK `id_laporan` baru
    await RiwayatSaldo.create(
      {
        id_profil: idUserPenerima,
        id_laporan: id_laporan,
        aktivitas: `Recycling: ${laporan.estimasi_berat}kg Sampah Skincare`,
        jumlah_saldo: parseInt(saldo_final),
        tipe_transaksi: "masuk",
        tanggal: new Date(),
      },
      { transaction: t },
    );

    // 4. Update data status penjemputan akhir di tabel recycle menjadi 'selesai'
    await Recycle.update(
      {
        status_jemput: "selesai",
        saldo_cair: parseInt(saldo_final),
      },
      { where: { id_laporan }, transaction: t },
    );

    // 5. Kirim Notifikasi penutup ke user bahwa saldo sudah cair ke dompet
    await Notifikasi.create(
      {
        id_profil_penerima: idUserPenerima,
        id_profil_pengirim: id_admin,
        id_laporan: id_laporan,
        tipe: "saldo_cair",
        pesan: `Proses daur ulang selesai! Saldo Rp ${parseInt(saldo_final).toLocaleString("id-ID")} telah berhasil ditambahkan ke dompet akun Anda.`,
        is_read: false,
        tanggal: new Date(),
      },
      { transaction: t },
    );

    // Komit transaksi
    await t.commit();

    res.json({
      status: "success",
      message: `Berhasil menyerahkan sampah ke pengepul! Saldo Rp ${parseInt(saldo_final).toLocaleString("id-ID")} telah ditransfer ke user ${profilUser.username}.`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error Finalisasi Daur Ulang:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
