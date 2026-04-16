const { Recycle, Profil, RiwayatPoin } = require("../models");

exports.submitLaporan = async (req, res) => {
  try {
    // 1. Ambil data dari Body Postman
    // PASTIKAN nama variabel di sini sama dengan yang Anda ketik di Postman
    const { id_profil, nama_produk, kategori, jumlah_botol } = req.body;

    // Logika perhitungan poin sederhana (misal 1 botol = 10 poin)
    const totalPoin = (jumlah_botol || 1) * 10;

    // 2. Simpan ke tabel laporan_daur_ulang
    const laporan = await Recycle.create({
      id_profil, // Ini yang tadi dianggap null, pastikan variabelnya ada nilainya
      nama_produk,
      kategori, // Pastikan di model sudah diganti dari jenis_kemasan ke kategori
      poin_didapat: totalPoin,
      status_daur_ulang: "pending",
    });

    // 3. Update total poin di Profil (Opsional tapi disarankan)
    const profil = await Profil.findByPk(id_profil);
    if (profil) {
      await profil.update({ total_poin: (profil.total_poin || 0) + totalPoin });
    }

    res.status(201).json({
      status: "success",
      message: "Laporan berhasil dikirim",
      data: laporan,
    });
  } catch (error) {
    // Error 400 muncul di sini jika ada field yang null padahal allowNull: false
    res.status(400).json({ status: "error", message: error.message });
  }
};
