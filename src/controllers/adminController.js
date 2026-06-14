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

//     // SINKRONISASI LOG USER: Update baris riwayat_saldo awal milik user agar statusnya ikut berubah dinamis
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
//  * FIX MUTLAK ANTI-DOUBLE: Menimpa log penjemputan awal Rp 0 menjadi dana cair riil
//  */
// exports.finalisasiDanKirimSaldo = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     // 🆕 1. Tangkap variabel 'berat_asli' yang dikirim oleh form modal admin frontend
//     const { id_laporan, saldo_final, berat_asli } = req.body;
//     const id_admin = req.user.id_profil;

//     // 🆕 Validasi tambahan untuk memastikan berat asli ikut terlampir
//     if (!id_laporan || !saldo_final || !berat_asli) {
//       await t.rollback();
//       return res.status(400).json({
//         status: "error",
//         message:
//           "ID Laporan, Jumlah Saldo Cair, dan Berat Fisik Asli wajib dilampirkan.",
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

//     // Update Saldo Dompet User
//     const saldoBaru = (profilUser.total_saldo || 0) + nominalSaldoFinal;
//     await profilUser.update({ total_saldo: saldoBaru }, { transaction: t });

//     // Mencari log transaksi lama untuk diperbarui statusnya
//     const logRiwayatLama = await RiwayatSaldo.findOne({
//       where: {
//         id_laporan: targetIdLaporan,
//         tipe_transaksi: "masuk", // Sesuaikan dengan string enum di DB Anda (misal 'masuk' atau 'pemasukan')
//       },
//       transaction: t,
//     });

//     if (logRiwayatLama) {
//       await logRiwayatLama.update(
//         {
//           status: "selesai",
//           // 🆕 Gunakan 'berat_asli' hasil input timbangan admin untuk deskripsi aktivitas riwayat dompet
//           aktivitas: `Recycling: ${berat_asli} Sampah Skincare`,
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
//           // 🆕 Gunakan 'berat_asli' untuk pencatatan log transaksi baru
//           aktivitas: `Recycling: ${berat_asli} Sampah Skincare`,
//           jumlah_saldo: nominalSaldoFinal,
//           tipe_transaksi: "masuk",
//           status: "selesai",
//           tanggal: new Date(),
//         },
//         { transaction: t },
//       );
//     }

//     // 🆕 2. UPDATE UTAMA: Timpa nilai estimasi_berat bawaan user dengan nilai pasti berat_asli dari admin
//     await laporan.update(
//       {
//         status_jemput: "selesai",
//         estimasi_berat: berat_asli,
//         saldo_cair: nominalSaldoFinal,
//       },
//       { transaction: t },
//     );

//     // Kirim Notifikasi Sukses Cair ke Aplikasi User
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
//  * 4. DATA STATISTIK UNTUK DASHBOARD UTAMA ADMIN (FIXED REFERENCE ERROR)
//  */
// exports.getDashboardOverviewStats = async (req, res) => {
//   try {
//     const totalProduk = await Produk.count();

//     // MENGHITUNG KATEGORI PRODUK SECARA DINAMIS
//     const kelompokKategori = await Produk.findAll({
//       attributes: [
//         "kategori",
//         [sequelize.fn("COUNT", sequelize.col("id_produk")), "jumlah"],
//       ],
//       group: ["kategori"],
//     });

//     // 🌟 FIX UTAMA: Memberikan kembali nama variabel 'distribusiProduk' yang sempat kosong akibat typo
//     let distribusiProduk = {};

//     if (totalProduk > 0) {
//       kelompokKategori.forEach((item) => {
//         const namaKategori = item.getDataValue("kategori") || "Lainnya";
//         const jumlah = parseInt(item.getDataValue("jumlah") || 0);
//         distribusiProduk[namaKategori] = Math.round(
//           (jumlah / totalProduk) * 100,
//         );
//       });
//     } else {
//       distribusiProduk = {};
//     }

//     // Mengambil data metrics counter box atas
//     const kategoriUnik = await Produk.findAll({
//       attributes: [
//         [sequelize.fn("DISTINCT", sequelize.col("kategori")), "kategori"],
//       ],
//     });

//     const totalKategori = kitchenSinkCategoryFix(kategoriUnik.length);
//     const totalOrders = await RiwayatSaldo.count({
//       where: { tipe_transaksi: "keluar" },
//     });
//     const orderPerluDiproses = await RiwayatSaldo.count({
//       where: { tipe_transaksi: "keluar", status: { [Op.not]: "selesai" } },
//     });

//     const totalBahan = await Kandungan.count();
//     const bahanAktifAman = await Kandungan.count();

//     const permintaanDaurUlangAktif = await Recycle.count({
//       where: {
//         status_jemput: { [Op.in]: ["menunggu_verifikasi", "sedang_dijemput"] },
//       },
//     });

//     // Query data untuk daftar tabel bawah dashboard
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

//     // PERHITUNGAN AKTIVITAS MINGGUAN REAL-TIME DENGAN FIX OBJEK TANGGAL
//     const hariLabels = [];
//     const datasetSampah = [];
//     const datasetOrder = [];
//     const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

//     for (let i = 6; i >= 0; i--) {
//       const startOfDay = new Date();
//       startOfDay.setDate(startOfDay.getDate() - i);
//       startOfDay.setHours(0, 0, 0, 0);

//       const endOfDay = new Date();
//       endOfDay.setDate(endOfDay.getDate() - i);
//       endOfDay.setHours(23, 59, 59, 999);

//       hariLabels.push(namaHari[startOfDay.getDay()]);

//       const countLaporan = await Recycle.count({
//         where: {
//           createdAt: { [Op.between]: [startOfDay, endOfDay] },
//           status_jemput: {
//             [Op.in]: ["selesai", "sedang_dijemput", "menunggu_verifikasi"],
//           },
//         },
//       });
//       datasetSampah.push(countLaporan * 3); // Bobot grafik representatif kg

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
//           materials: {
//             total: totalBahan,
//             aman: boksBahanAmanFix(bahanAktifAman),
//           },
//           recycle: { aktif: permintaanDaurUlangAktif },
//         },
//         chartWeekly: {
//           labels: hariLabels,
//           sampah: datasetSampah,
//           order: datasetOrder,
//         },
//         distribusiProduk, // 🌟 Sekarang variabel terkirim dengan aman tanpa error
//         laporanTerbaru,
//         orderTerbaru,
//       },
//     });
//   } catch (error) {
//     console.error("Error Fetch Dashboard Overview Stats:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };
// // Fungsi pembantu jika kategori terdeteksi kosong
// function kitchenSinkCategoryFix(len) {
//   return len === 0 ? 0 : len;
// }

// // Fungsi pembantu jika bahan aman kosong
// function boksBahanAmanFix(count) {
//   return count === 0 ? 0 : count;
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

    await laporan.update(
      { status_jemput: "sedang_dijemput" },
      { transaction: t },
    );

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
        "Verifikasi berhasil! Status diperbarui menjadi 'Dalam Penjemputan'.",
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
 * 🚀 TARGET SINKRONISASI: Mengarahkan nilai input admin murni ke kolom 'berat_asli'
 */
exports.finalisasiDanKirimSaldo = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id_laporan, saldo_final, berat_asli } = req.body;
    const id_admin = req.user.id_profil;

    if (!id_laporan || !saldo_final || !berat_asli) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message:
          "ID Laporan, Jumlah Saldo Cair, dan Berat Fisik Asli wajib dilampirkan.",
      });
    }

    const targetIdLaporan = parseInt(id_laporan);
    const nominalSaldoFinal = parseInt(saldo_final);

    const laporan = await Recycle.findByPk(targetIdLaporan, { transaction: t });
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
    const profilUser = await Profil.findByPk(idUserPenerima, {
      transaction: t,
    });
    if (!profilUser) {
      await t.rollback();
      return res
        .status(404)
        .json({
          status: "error",
          message: "Profil akun pengguna tidak ditemukan.",
        });
    }

    // Ekstrak string teks "4 kg" menjadi float angka murni 4.0 agar aman untuk database
    const angkaBeratMurni = berat_asli
      ? parseFloat(String(berat_asli).replace(/[^0-9.]/g, ""))
      : 0;

    // Update Saldo Dompet User
    const saldoBaru = (profilUser.total_saldo || 0) + nominalSaldoFinal;
    await profilUser.update({ total_saldo: saldoBaru }, { transaction: t });

    // Update Log Transaksi Riwayat Saldo
    const logRiwayatLama = await RiwayatSaldo.findOne({
      where: { id_laporan: targetIdLaporan, tipe_transaksi: "masuk" },
      transaction: t,
    });

    if (logRiwayatLama) {
      await logRiwayatLama.update(
        {
          status: "selesai",
          aktivitas: `Recycling: ${angkaBeratMurni}kg Sampah Skincare`,
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
          aktivitas: `Recycling: ${angkaBeratMurni}kg Sampah Skincare`,
          jumlah_saldo: nominalSaldoFinal,
          tipe_transaksi: "masuk",
          status: "selesai",
          tanggal: new Date(),
        },
        { transaction: t },
      );
    }

    // 🚀 FIX LOCK: Simpan angka murni ke kolom 'berat_asli', biarkan estimasi_berat milik user tetap utuh
    await laporan.update(
      {
        status_jemput: "selesai",
        berat_asli: angkaBeratMurni,
        saldo_cair: nominalSaldoFinal,
      },
      { transaction: t },
    );

    // Kirim Notifikasi Sukses Cair ke Aplikasi User
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
      message: `Berhasil menyerahkan sampah ke pengepul! Saldo Rp ${nominalSaldoFinal.toLocaleString("id-ID")} telah ditransfer.`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error Finalisasi Daur Ulang:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * 5. DATA STATISTIK UNTUK DASHBOARD UTAMA ADMIN
 */
exports.getDashboardOverviewStats = async (req, res) => {
  try {
    const totalProduk = await Produk.count();
    const kelompokKategori = await Produk.findAll({
      attributes: [
        "kategori",
        [sequelize.fn("COUNT", sequelize.col("id_produk")), "jumlah"],
      ],
      group: ["kategori"],
    });

    let distribusiProduk = {};
    if (totalProduk > 0) {
      kelompokKategori.forEach((item) => {
        const namaKategori = item.getDataValue("kategori") || "Lainnya";
        const jumlah = parseInt(item.getDataValue("jumlah") || 0);
        distribusiProduk[namaKategori] = Math.round(
          (jumlah / totalProduk) * 100,
        );
      });
    }

    const kategoriUnik = await Produk.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("kategori")), "kategori"],
      ],
    });

    const totalOrders = await RiwayatSaldo.count({
      where: { tipe_transaksi: "keluar" },
    });
    const orderPerluDiproses = await RiwayatSaldo.count({
      where: { tipe_transaksi: "keluar", status: { [Op.not]: "selesai" } },
    });

    const totalBahan = await Kandungan.count();
    const permintaanDaurUlangAktif = await Recycle.count({
      where: {
        status_jemput: { [Op.in]: ["menunggu_verifikasi", "sedang_dijemput"] },
      },
    });

    const laporanTerbaru = await Recycle.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Profil, as: "penulis_laporan", attributes: ["username"] },
      ],
    });

    const orderTerbaru = await RiwayatSaldo.findAll({
      where: { tipe_transaksi: "keluar" },
      limit: 5,
      order: [["tanggal", "DESC"]],
      include: [{ model: Profil, as: "pembeli", attributes: ["username"] }],
    });

    const hariLabels = [];
    const datasetSampah = [];
    const datasetOrder = [];
    const namaHari = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 6; i >= 0; i--) {
      const startOfDay = new Date();
      startOfDay.setDate(startOfDay.getDate() - i);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setDate(endOfDay.getDate() - i);
      endOfDay.setHours(23, 59, 59, 999);

      hariLabels.push(namaHari[startOfDay.getDay()]);

      const countLaporan = await Recycle.count({
        where: {
          createdAt: { [Op.between]: [startOfDay, endOfDay] },
          status_jemput: {
            [Op.in]: ["selesai", "sedang_dijemput", "menunggu_verifikasi"],
          },
        },
      });
      datasetSampah.push(countLaporan * 3);

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
          catalog: { produk: totalProduk, kategori: kategoriUnik.length },
          sales: { total: totalOrders, pending: orderPerluDiproses },
          materials: { total: totalBahan, aman: totalBahan },
          recycle: { aktif: permintaanDaurUlangAktif },
        },
        chartWeekly: {
          labels: hariLabels,
          sampah: datasetSampah,
          order: datasetOrder,
        },
        distribusiProduk,
        laporanTerbaru,
        orderTerbaru,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
