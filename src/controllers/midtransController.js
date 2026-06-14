const { RiwayatSaldo, Notifikasi } = require("../models");

exports.handleNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Ambil orderId untuk mengekstrak id_riwayat database yang kita sematkan sebelumnya
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Contoh format: SKC-BILL-14-1718123456 -> Ambil angka 14 sebagai ID Riwayat
    const parts = orderId.split("-");
    const idRiwayat = parts[2];

    if (!idRiwayat) {
      return res
        .status(400)
        .json({ status: "error", message: "ID Riwayat tidak valid." });
    }

    const logRiwayat = await RiwayatSaldo.findByPk(idRiwayat);
    if (!logRiwayat) {
      return res
        .status(404)
        .json({ status: "error", message: "Log transaksi tidak ditemukan." });
    }

    // Melakukan verifikasi perubahan status transaksi murni dari payment gateway Midtrans
    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      if (fraudStatus === "challenge") {
        await logRiwayat.update({ status: "CHALLENGE" });
      } else if (fraudStatus === "accept") {
        // Pembayaran sukses mutlak! Ubah status dari PENDING menjadi PENDING (Siap diproses admin, tapi transaksi lunas)
        await logRiwayat.update({ status: "PENDING" });

        await Notifikasi.create({
          id_profil_penerima: logRiwayat.id_profil,
          tipe: "transaksi_belanja",
          pesan: `Pembayaran via Midtrans untuk pesanan Anda berhasil diverifikasi! Menunggu proses kemas admin.`,
          is_read: false,
          tanggal: new Date(),
        });
      }
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      // Pembayaran gagal atau kadaluarsa
      await logRiwayat.update({ status: "GAGAL" });
    } else if (transactionStatus === "pending") {
      await logRiwayat.update({ status: "PENDING" });
    }

    return res.json({
      status: "success",
      message: "Webhook Midtrans berhasil diproses.",
    });
  } catch (error) {
    console.error("Webhook Midtrans Error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
