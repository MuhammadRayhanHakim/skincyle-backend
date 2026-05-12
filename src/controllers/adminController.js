const { Recycle, Profil, RiwayatSaldo } = require("../models");

exports.verifikasiDanCairkanSaldo = async (req, res) => {
  try {
    const { id_laporan, saldo_final } = req.body;

    // 1. Cari data laporan recycle
    const laporan = await Recycle.findByPk(id_laporan);
    if (!laporan) {
      return res
        .status(404)
        .json({ status: "error", message: "Laporan tidak ditemukan" });
    }

    if (laporan.status_jemput === "selesai") {
      return res.status(400).json({
        status: "error",
        message: "Laporan sudah pernah diverifikasi",
      });
    }

    // 2. Update saldo di Profil User
    const profil = await Profil.findByPk(laporan.id_profil);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil pengguna tidak ditemukan" });
    }

    // Update saldo user
    await profil.update({
      total_saldo: (profil.total_saldo || 0) + saldo_final,
    });

    // 3. Catat ke Riwayat Saldo (LOGIKA BARU)
    await RiwayatSaldo.create({
      id_profil: laporan.id_profil,
      aktivitas: `Pencairan Saldo Recycle (ID Laporan: #${id_laporan})`,
      jumlah_saldo: saldo_final,
      tipe_transaksi: "masuk",
      tanggal: new Date(),
    });

    // 4. Update status laporan di tabel recycle
    await laporan.update({
      status_jemput: "selesai",
      saldo_cair: saldo_final,
    });

    res.json({
      status: "success",
      message: `Berhasil! Saldo Rp${saldo_final} telah dikirim ke user ${profil.username}`,
      data: {
        id_laporan: id_laporan,
        saldo_masuk: saldo_final,
        total_saldo_sekarang: profil.total_saldo,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
