const { Recycle } = require("../models");

exports.submitDropVerify = async (req, res) => {
  try {
    const {
      id_profil,
      rincian_karung,
      alamat_penjemputan,
      estimasi_berat,
      foto_bukti,
    } = req.body;

    const laporan = await Recycle.create({
      id_profil,
      rincian_karung_visual: rincian_karung, // Data dari klik tombol +
      alamat_penjemputan,
      estimasi_berat,
      foto_bukti_fisik: foto_bukti,
      status_jemput: "menunggu_verifikasi",
      saldo_cair: 0, // Belum ada saldo masuk
    });

    res.status(201).json({
      status: "success",
      message:
        "Permintaan penjemputan dikirim. Saldo akan cair setelah dikonfirmasi admin.",
      data: laporan,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
