const { Recycle, Notifikasi, Profil } = require("../models");

exports.submitDropVerify = async (req, res) => {
  try {
    const { rincian_karung, alamat_penjemputan, estimasi_berat } = req.body;
    const id_profil_user = req.user.id_profil;

    const rincianParsed =
      typeof rincian_karung === "string"
        ? JSON.parse(rincian_karung)
        : rincian_karung;

    // 1. Simpan laporan ke database
    const laporan = await Recycle.create({
      id_profil: id_profil_user,
      rincian_karung_visual: rincianParsed,
      alamat_penjemputan,
      estimasi_berat: parseFloat(estimasi_berat) || 0,
      foto_bukti_fisik: req.file ? req.file.filename : "default.jpg",
      status_jemput: "menunggu_verifikasi",
      saldo_cair: 0,
    });

    // 2. Kirim Notifikasi ke Admin secara dinamis (HANYA SATU SAJA)
    const admin = await Profil.findOne({ where: { role: "admin" } });

    if (admin) {
      await Notifikasi.create({
        id_profil_penerima: admin.id_profil,
        id_profil_pengirim: id_profil_user,
        id_laporan: laporan.id_laporan, // Pastikan ID laporan disertakan
        tipe: "penjemputan_baru",
        pesan: `Permintaan penjemputan baru dari ${req.user.username} di wilayah Bekasi Regency.`,
        is_read: false,
        tanggal: new Date(),
      });
    }

    res.status(201).json({
      status: "success",
      message: "Laporan berhasil terkirim!",
      data: laporan,
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Gagal memproses laporan" });
  }
};

exports.getUserRecycleHistory = async (req, res) => {
  try {
    const id_profil_user = req.user.id_profil; // Diambil dari authMiddleware

    // 1. Ambil seluruh data pengiriman sampah dari user ini
    const dataLaporan = await Recycle.findAll({
      where: { id_profil: id_profil_user },
      order: [["createdAt", "DESC"]],
    });

    // 2. Ambil total saldo wallet user saat ini dari profilnya
    const profilUser = await Profil.findByPk(id_profil_user, {
      attributes: ["total_saldo"],
    });

    res.json({
      status: "success",
      data: {
        total_saldo: profilUser ? profilUser.total_saldo : 0,
        laporan: dataLaporan,
      },
    });
  } catch (error) {
    console.error("Error Get User History:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
