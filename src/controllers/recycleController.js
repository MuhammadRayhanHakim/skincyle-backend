const { Recycle, Notifikasi, Profil, RiwayatSaldo } = require("../models");
// Mengimpor koneksi instance sequelize agar fitur Transaction database berjalan lancar
const sequelize = require("../config/db");

// ── [1] USER: SUBMIT LAPORAN DAUR ULANG BARU ──
exports.submitDropVerify = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // 🚀 TANGKAP DATA LATITUDE DAN LONGITUDE DARI FRONTEND REQ.BODY
    const {
      rincian_karung,
      alamat_penjemputan,
      estimasi_berat,
      latitude,
      longitude,
    } = req.body;
    const id_profil_user = req.user.id_profil;

    const rincianParsed =
      typeof rincian_karung === "string"
        ? JSON.parse(rincian_karung)
        : rincian_karung;

    // Simpan data ke database lengkap dengan koordinat petanya
    const laporan = await Recycle.create(
      {
        id_profil: id_profil_user,
        rincian_karung_visual: rincianParsed,
        alamat_penjemputan,
        latitude: latitude ? parseFloat(latitude) : null, // Simpan lintang koordinat maps
        longitude: longitude ? parseFloat(longitude) : null, // Simpan bujur koordinat maps
        estimasi_berat: estimasi_berat || "0 kg",
        foto_bukti_fisik: req.file ? req.file.filename : "default.jpg",
        status_jemput: "menunggu_verifikasi",
        saldo_cair: 0,
      },
      { transaction: t },
    );

    const laporanBaru = await laporan.reload({ transaction: t });

    const beratBarsihTeks = String(estimasi_berat)
      .toLowerCase()
      .replace("kg", "")
      .trim();

    await RiwayatSaldo.create(
      {
        id_profil: id_profil_user,
        id_laporan: laporanBaru.id_laporan,
        aktivitas: `Recycling: ${beratBarsihTeks}kg Sampah Skincare`,
        jumlah_saldo: 0,
        tipe_transaksi: "masuk",
        status: "menunggu_verifikasi",
        tanggal: new Date(),
      },
      { transaction: t },
    );

    const admin = await Profil.findOne({
      where: { role: "admin" },
      transaction: t,
    });
    if (admin) {
      await Notifikasi.create(
        {
          id_profil_penerima: admin.id_profil,
          id_profil_pengirim: id_profil_user,
          id_laporan: laporanBaru.id_laporan,
          tipe: "penjemputan_baru",
          pesan: `Permintaan penjemputan baru dari ${req.user.username} di wilayah Bekasi Regency.`,
          is_read: false,
          tanggal: new Date(),
        },
        { transaction: t },
      );
    }

    await t.commit();
    res.status(201).json({
      status: "success",
      message: "Laporan setoran berhasil terkirim dan tercatat di riwayat!",
      data: laporanBaru,
    });
  } catch (error) {
    await t.rollback();
    console.error("Backend Error Daur Ulang:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal memproses laporan daur ulang sirkular",
    });
  }
};

// ── [2] ADMIN: KLIK "SELESAIKAN VERIFIKASI" (Status beralih ke 'sedang_dijemput') ──
exports.verifyRecycle = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_laporan } = req.body;

    const laporan = await Recycle.findByPk(id_laporan, { transaction: t });
    if (!laporan) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Laporan tidak ditemukan." });
    }

    // Perbarui status alur laporan utama menjadi "sedang_dijemput"
    await laporan.update(
      { status_jemput: "sedang_dijemput" },
      { transaction: t },
    );

    // Sinkronisasikan status pelacakan di tabel riwayat_saldo agar user tahu kurir sedang menjemput karung sampah
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

    await t.commit();
    res.json({
      status: "success",
      message:
        "Verifikasi berhasil! Status pengguna kini diperbarui menjadi 'Dalam Penjemputan'.",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error verifyRecycle admin:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ── [3] ADMIN: KLIK "KIRIM SALDO" (Status beralih ke 'selesai' / 'SELESAI') ──
exports.finalRecycle = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_laporan, saldo_final } = req.body;

    const targetIdLaporan = parseInt(id_laporan);
    const nominalSaldoFinal = parseInt(saldo_final);

    const laporan = await Recycle.findByPk(targetIdLaporan, { transaction: t });
    if (!laporan) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Laporan tidak ditemukan." });
    }

    // 1. Update status alur laporan utama menjadi selesai (huruf kecil)
    await laporan.update(
      {
        status_jemput: "selesai",
        saldo_cair: nominalSaldoFinal,
      },
      { transaction: t },
    );

    // 2. Cari log lama di riwayat_saldo berdasarkan targetIdLaporan
    const logRiwayat = await RiwayatSaldo.findOne({
      where: {
        id_laporan: targetIdLaporan,
        tipe_transaksi: "masuk",
      },
      transaction: t,
    });

    if (logRiwayat) {
      // 🎯 TIMPA BARIS YANG SAMA: Perbarui status menjadi huruf kecil "selesai" agar selaras dengan model utama!
      await logRiwayat.update(
        {
          status: "selesai", // 🌟 FIX UTAMA: Diubah dari "SELESAI" menjadi "selesai" (huruf kecil)
          aktivitas: `Recycling: ${laporan.estimasi_berat}kg Sampah Skincare`,
          jumlah_saldo: nominalSaldoFinal, // Nilai 0 langsung tertimpa saldo aktual
          tanggal: new Date(),
        },
        { transaction: t },
      );
    } else {
      // Fallback aman jika data penjemputan awal tidak terdeteksi
      await RiwayatSaldo.create(
        {
          id_profil: laporan.id_profil,
          id_laporan: targetIdLaporan,
          aktivitas: `Recycling: ${laporan.estimasi_berat}kg Sampah Skincare`,
          jumlah_saldo: nominalSaldoFinal,
          tipe_transaksi: "masuk",
          status: "selesai", // Gunakan huruf kecil secara konsisten
          tanggal: new Date(),
        },
        { transaction: t },
      );
    }

    // 3. Tambahkan saldo cair tersebut ke total_saldo akun profil milik pelanggan secara riil
    const userProfil = await Profil.findByPk(laporan.id_profil, {
      transaction: t,
    });
    if (userProfil) {
      const saldoBaru = userProfil.total_saldo + nominalSaldoFinal;
      await userProfil.update({ total_saldo: saldoBaru }, { transaction: t });
    }

    await t.commit();
    res.json({
      status: "success",
      message:
        "Saldo reward berhasil ditransfer dan pelacakan dinyatakan Selesai!",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error finalRecycle admin:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
// ── [4] USER: AMBIL GABUNGAN RIWAYAT AKTIVITAS DOMPET ──
// exports.getUserRecycleHistory = async (req, res) => {
//   try {
//     const id_profil_user = req.user.id_profil;

//     const profilUser = await Profil.findByPk(id_profil_user, {
//       attributes: ["total_saldo"],
//     });

//     if (!profilUser) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan." });
//     }

//     // Ambil seluruh data dari riwayat_saldo (gabungan belanja & recycle) milik user ini
//     const dataRiwayat = await RiwayatSaldo.findAll({
//       where: { id_profil: id_profil_user },
//       order: [["tanggal", "DESC"]],
//       include: [
//         {
//           model: Recycle,
//           as: "detail_laporan",
//           attributes: ["status_jemput", "foto_bukti_fisik", "estimasi_berat"],
//           required: false,
//         },
//       ],
//     });

//     res.json({
//       status: "success",
//       data: {
//         total_saldo: profilUser.total_saldo,
//         riwayat: dataRiwayat,
//       },
//     });
//   } catch (error) {
//     console.error("Error Fetch History Terintegrasi:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

exports.getUserRecycleHistory = async (req, res) => {
  try {
    const id_profil_user = req.user.id_profil;

    const profilUser = await Profil.findByPk(id_profil_user, {
      attributes: ["total_saldo"],
    });

    if (!profilUser) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan." });
    }

    // Ambil seluruh data dari riwayat_saldo (gabungan belanja & recycle) milik user ini
    const dataRiwayat = await RiwayatSaldo.findAll({
      where: { id_profil: id_profil_user },
      order: [["tanggal", "DESC"]],
      include: [
        {
          model: Recycle,
          as: "detail_laporan",
          attributes: ["status_jemput", "foto_bukti_fisik", "estimasi_berat"],
          required: false, // Menjamin data belanja (id_laporan = null) tetap ikut ditarik
        },
      ],
    });

    res.json({
      status: "success",
      data: {
        total_saldo: profilUser.total_saldo,
        // 🎯 PERBAIKAN: Mengirimkan dua alternatif properti 'riwayat' dan 'laporan'
        // agar frontend lama maupun baru Anda bisa membacanya tanpa memicu error/kosong
        riwayat: dataRiwayat,
        laporan: dataRiwayat,
      },
    });
  } catch (error) {
    console.error("Error Fetch History Terintegrasi:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
