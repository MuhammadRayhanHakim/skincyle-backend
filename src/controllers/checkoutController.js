const snap = require("../config/midtrans");
const {
  Profil,
  RiwayatSaldo,
  TransaksiBelanja,
  Notifikasi,
} = require("../models");
const sequelize = require("../config/db");

exports.prosesCheckout = async (req, res) => {
  // Menggunakan ACID Transaction Sequelize untuk menjamin keamanan query database
  const t = await sequelize.transaction();

  try {
    const {
      total_bayar, // Nominal saldo internal yang digunakan (jika ada)
      item_deskripsi, // Deskripsi produk
      nomor_telepon, // Diambil dari formData.telepon frontend
      alamat_rumah, // Alamat pengiriman fisik atau toko
      jenis_pembelian, // 'saldo' atau 'penuh'
      total_pembayaran_gateway, // Nominal tunai bersih wajib bayar via Midtrans
    } = req.body;

    const id_user = req.user.id_profil;

    // ─── KONDISI 1: PEMBAYARAN MURNI PAKAI SALDO INTERNAL DAN LUNAS (Rp 0) ───
    if (jenis_pembelian === "saldo" && total_pembayaran_gateway === 0) {
      const userProfil = await Profil.findByPk(id_user, { transaction: t });
      if (!userProfil || userProfil.total_saldo < total_bayar) {
        await t.rollback();
        return res
          .status(400)
          .json({
            status: "error",
            message: "Saldo internal Anda tidak mencukupi.",
          });
      }

      // 1. Potong Saldo Akun User
      const saldoTerbaru = userProfil.total_saldo - total_bayar;
      await userProfil.update(
        { total_saldo: saldoTerbaru },
        { transaction: t },
      );

      // 2. Buat Baris Riwayat Saldo Baru (Wajib untuk foreign key id_riwayat)
      const riwayatLokal = await RiwayatSaldo.create(
        {
          id_profil: id_user,
          aktivitas: `Belanja: ${item_deskripsi.substring(0, 200)}`, // Menyesuaikan nama kolom model RiwayatSaldo
          jumlah_saldo: total_bayar, // Menyesuaikan nama kolom model RiwayatSaldo
          tipe_transaksi: "keluar", // Menyesuaikan enum model RiwayatSaldo
          status: "SUKSES", // Mengisi status transaksi
          tanggal: new Date(),
        },
        { transaction: t },
      );

      // 3. Simpan Transaksi Belanja (Sesuai nama kolom model di 12.txt)
      const transaksiLokal = await TransaksiBelanja.create(
        {
          id_riwayat: riwayatLokal.id_riwayat, // Menyematkan foreign key hasil insert
          nomor_telepon: nomor_telepon, // Sesuai kolom database
          alamat_rumah: alamat_rumah, // Sesuai kolom database
          jenis_pembelian: "saldo", // Sesuai kolom database
        },
        { transaction: t },
      );

      // 4. Buat Notifikasi Akun
      await Notifikasi.create(
        {
          id_profil: id_user,
          tipe: "transaksi_belanja",
          pesan: `Pembayaran Rp ${total_bayar.toLocaleString("id-ID")} sukses menggunakan saldo internal.`,
          is_read: false,
          tanggal: new Date(),
        },
        { transaction: t },
      );

      await t.commit();

      return res.json({
        status: "success",
        payment_type: "saldo_internal",
        message: "Pembayaran saldo internal berhasil.",
        data: { total_saldo_sekarang: saldoTerbaru, transaksi: transaksiLokal },
      });
    }

    // ─── KONDISI 2: PEMBAYARAN VIA MIDTRANS GATEWAY (TAGIHAN > 0) ───

    // 1. Buat Baris Riwayat Saldo dengan status "PENDING" terlebih dahulu
    // Hal ini wajib dilakukan karena model TransaksiBelanja memerlukan 'id_riwayat' yang tidak boleh null
    const riwayatGateway = await RiwayatSaldo.create(
      {
        id_profil: id_user,
        aktivitas: `Belanja via Midtrans: ${item_deskripsi.substring(0, 200)}`, //
        jumlah_saldo: total_pembayaran_gateway, //
        tipe_transaksi: "keluar", //
        status: "PENDING", // Menjamin default awal huruf besar PENDING
        tanggal: new Date(),
      },
      { transaction: t },
    );

    // 2. Simpan Transaksi Belanja ke Database (Sesuai nama kolom model di 12.txt)
    await TransaksiBelanja.create(
      {
        id_riwayat: riwayatGateway.id_riwayat, // Menghubungkan ID Riwayat agar validasi lolos!
        nomor_telepon: nomor_telepon, // Menyesuaikan nama kolom model
        alamat_rumah: alamat_rumah, // Menyesuaikan nama kolom model
        jenis_pembelian: jenis_pembelian, // Menyimpan opsi pembelian yang dipilih
      },
      { transaction: t },
    );

    // Jika user membayar parsial (kombinasi potong saldo sebagian + sisanya bayar tunai via Midtrans)
    if (jenis_pembelian === "saldo" && total_bayar > 0) {
      const userProfil = await Profil.findByPk(id_user, { transaction: t });
      if (userProfil && userProfil.total_saldo >= total_bayar) {
        const saldoTerbaru = userProfil.total_saldo - total_bayar;
        await userProfil.update(
          { total_saldo: saldoTerbaru },
          { transaction: t },
        );

        await RiwayatSaldo.create(
          {
            id_profil: id_user,
            aktivitas: `Uang muka saldo untuk belanja via Midtrans`, //
            jumlah_saldo: total_bayar, //
            tipe_transaksi: "keluar", //
            status: "SUKSES",
            tanggal: new Date(),
          },
          { transaction: t },
        );
      }
    }

    // 3. Konfigurasi Parameter Payload untuk Dikirim ke Midtrans Snap API
    // ID Order dikaitkan langsung dengan id_riwayat agar sinkronisasi webhook di masa depan sangat mudah dicari
    const orderId = `SKC-BILL-${riwayatGateway.id_riwayat}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total_pembayaran_gateway,
      },
      item_details: [
        {
          id: `item-${riwayatGateway.id_riwayat}`,
          price: total_pembayaran_gateway,
          quantity: 1,
          name: item_deskripsi.substring(0, 45),
        },
      ],
      customer_details: {
        first_name: req.user.username || "Pelanggan",
        phone: nomor_telepon,
      },
    };

    // 4. Minta Sesi Token Transaksi ke Core Server Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Komit seluruh operasi ke database PostgreSQL
    await t.commit();

    // 5. Kirim snapToken dengan aman ke frontend React Anda
    return res.json({
      status: "success",
      payment_type: "midtrans",
      snapToken: transaction.token,
      orderId: orderId,
    });
  } catch (error) {
    // Batalkan seluruh antrean database jika terjadi kegagalan di tengah jalan
    await t.rollback();
    console.error("Checkout Midtrans Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
