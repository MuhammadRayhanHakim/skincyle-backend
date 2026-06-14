const {
  Recycle,
  Notifikasi,
  Profil,
  RiwayatSaldo,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

// ── [1] USER: SUBMIT LAPORAN DAUR ULANG BARU ──
exports.submitDropVerify = async (req, res) => {
  const t = await sequelize.transaction();
  try {
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

    const laporan = await Recycle.create(
      {
        id_profil: id_profil_user,
        rincian_karung_visual: rincianParsed,
        alamat_penjemputan,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
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

// ── [2] ADMIN: KLIK "SELESAIKAN VERIFIKASI" ──
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

    await t.commit();
    res.json({
      status: "success",
      message:
        "Verifikasi berhasil! Status pengguna kini diperbarui menjadi 'Dalam Penjemputan'.",
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ── [3] ADMIN: KLIK "KIRIM SALDO" ──
exports.finalRecycle = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id_laporan, saldo_final, berat_asli } = req.body;

    const targetIdLaporan = parseInt(id_laporan);
    const nominalSaldoFinal = parseInt(saldo_final);

    const laporan = await Recycle.findByPk(targetIdLaporan, { transaction: t });
    if (!laporan) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Laporan tidak ditemukan." });
    }

    if (laporan.status_jemput === "selesai") {
      await t.rollback();
      return res
        .status(400)
        .json({
          status: "error",
          message: "Laporan ini sudah diselesaikan sebelumnya.",
        });
    }

    const angkaBeratMurni = berat_asli
      ? parseFloat(String(berat_asli).replace(/[^0-9.]/g, ""))
      : 0;

    await laporan.update(
      {
        status_jemput: "selesai",
        saldo_cair: nominalSaldoFinal,
        berat_asli: angkaBeratMurni,
      },
      { transaction: t },
    );

    const logRiwayat = await RiwayatSaldo.findOne({
      where: { id_laporan: targetIdLaporan, tipe_transaksi: "masuk" },
      transaction: t,
    });

    if (logRiwayat) {
      await logRiwayat.update(
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
          id_profil: laporan.id_profil,
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

    const userProfil = await Profil.findByPk(laporan.id_profil, {
      transaction: t,
    });
    if (userProfil) {
      const saldoBaru = (userProfil.total_saldo || 0) + nominalSaldoFinal;
      const totalBeratBaru =
        (userProfil.total_berat_kontribusi || 0) + angkaBeratMurni;
      const jumlahSetoranBaru = (userProfil.jumlah_setoran || 0) + 1;

      let levelBaru = "Newbie";
      if (totalBeratBaru >= 90) levelBaru = "Penjaga";
      else if (totalBeratBaru >= 60) levelBaru = "Eco";
      else if (totalBeratBaru >= 1) levelBaru = "Pahlawan Hijau";

      await userProfil.update(
        {
          total_saldo: saldoBaru,
          total_berat_kontribusi: totalBeratBaru,
          jumlah_setoran: jumlahSetoranBaru,
          level_pengguna: levelBaru,
        },
        { transaction: t },
      );
    }

    await t.commit();
    res.json({
      status: "success",
      message:
        "Saldo reward berhasil ditransfer dan pelacakan dinyatakan Selesai!",
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getUserRecycleHistory = async (req, res) => {
  try {
    const id_profil_user = req.user.id_profil;
    const profilUser = await Profil.findByPk(id_profil_user, {
      attributes: ["total_saldo"],
    });

    if (!profilUser)
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan." });

    const dataRiwayat = await RiwayatSaldo.findAll({
      where: { id_profil: id_profil_user },
      order: [["tanggal", "DESC"]],
      include: [
        {
          model: Recycle,
          as: "detail_laporan",
          attributes: ["status_jemput", "foto_bukti_fisik", "estimasi_berat"],
          required: false,
        },
      ],
    });

    res.json({
      status: "success",
      data: {
        total_saldo: profilUser.total_saldo,
        riwayat: dataRiwayat,
        laporan: dataRiwayat,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
