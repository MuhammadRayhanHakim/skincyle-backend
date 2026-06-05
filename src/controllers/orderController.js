const {
  RiwayatSaldo,
  Profil,
  TransaksiBelanja,
  Notifikasi,
} = require("../models");

// 1. Ambil semua pesanan belanja user + Join data relasi tabel baru secara rapi
exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await RiwayatSaldo.findAll({
      where: { tipe_transaksi: "keluar" },
      order: [["tanggal", "DESC"]],
      include: [
        {
          model: Profil,
          as: "pembeli",
          attributes: ["username", "foto_profil"],
          required: false,
        },
        {
          model: TransaksiBelanja,
          as: "rincian_pengiriman",
          attributes: ["nomor_telepon", "alamat_rumah", "jenis_pembelian"],
          required: false,
        },
      ],
    });
    res.json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error("Error Admin Fetch Orders:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. Memperbarui status alur pesanan dari admin console + Trigger Notifikasi Feedback ke User
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id_riwayat } = req.params;
    const { status } = req.body;
    const id_admin = req.user.id_profil;

    const logRiwayat = await RiwayatSaldo.findByPk(id_riwayat);
    if (!logRiwayat) {
      return res
        .status(404)
        .json({ status: "error", message: "Data transaksi tidak ditemukan." });
    }

    const statusTerpilih = String(status).trim().toUpperCase();

    const daftarStatusValid = ["PENDING", "PROCESSING", "SHIPPED", "SELESAI"];
    if (!daftarStatusValid.includes(statusTerpilih)) {
      return res.status(400).json({
        status: "error",
        message: "Format status pelacakan belanja tidak valid.",
      });
    }

    // Perbarui status log pelacakan belanja di database
    await logRiwayat.update({ status: statusTerpilih });

    // 🚀 NOTIFIKASI TRIGGER 2: Kirim pemberitahuan alur pengiriman paket secara otomatis ke akun pelanggan
    let pesanNotifTeks = `Status pesanan Anda #TRX-0${id_riwayat} telah diperbarui menjadi ${statusTerpilih}.`;
    if (statusTerpilih === "PROCESSING")
      pesanNotifTeks = `Pesanan produk SkinCycle Anda #TRX-0${id_riwayat} sedang dikemas dan dipersiapkan oleh tim admin!`;
    if (statusTerpilih === "SHIPPED")
      pesanNotifTeks = `Paket produk SkinCycle Anda #TRX-0${id_riwayat} telah diserahkan ke kurir dan sedang dalam perjalanan!`;
    if (statusTerpilih === "SELESAI")
      pesanNotifTeks = `Transaksi Berhasil Selesai! Produk SkinCycle Anda #TRX-0${id_riwayat} telah diterima. Terima kasih!`;

    await Notifikasi.create({
      id_profil_penerima: logRiwayat.id_profil, // Mengarah ke user pembeli produk
      id_profil_pengirim: id_admin, // Dari admin yang melakukan verifikasi status
      id_posting: null,
      id_komentar: null,
      id_laporan: null,
      tipe: "perubahan_status_order",
      pesan: pesanNotifTeks,
      is_read: false,
      tanggal: new Date(),
    });

    res.json({
      status: "success",
      message: `Status belanja berhasil diperbarui menjadi ${statusTerpilih} dan pengguna telah dinotifikasi.`,
      data: logRiwayat,
    });
  } catch (error) {
    console.error("Error updateOrderStatus admin:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
