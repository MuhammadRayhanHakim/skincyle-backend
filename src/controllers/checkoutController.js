const {
  Profil,
  RiwayatSaldo,
  TransaksiBelanja,
  Notifikasi,
} = require("../models");
const sequelize = require("../config/db");

exports.prosesCheckout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      total_bayar,
      item_deskripsi,
      nomor_telepon,
      alamat_rumah,
      jenis_pembelian,
    } = req.body;
    const id_profil = req.user.id_profil;

    const profil = await Profil.findByPk(id_profil, { transaction: t });
    if (!profil) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Profil pengguna tidak ditemukan." });
    }

    const nominalPotongSaldo = parseInt(total_bayar) || 0;

    // Validasi kecukupan saldo jika menggunakan opsi potong saldo
    if (jenis_pembelian === "saldo" && nominalPotongSaldo > 0) {
      if (profil.total_saldo < nominalPotongSaldo) {
        await t.rollback();
        return res.status(400).json({
          status: "error",
          message: `Saldo tidak mencukupi. Sisa saldo Anda: Rp ${profil.total_saldo.toLocaleString("id-ID")}`,
        });
      }
    }

    // Kalkulasi sisa saldo (jika harga penuh, nominalPotongSaldo = 0 sehingga saldo tetap utuh)
    const sisaSaldo =
      jenis_pembelian === "saldo"
        ? profil.total_saldo - nominalPotongSaldo
        : profil.total_saldo;

    // 1. Update total_saldo pengguna ke database
    await profil.update({ total_saldo: sisaSaldo }, { transaction: t });

    // Label penanda untuk admin agar tahu jenis transaksi pembayaran user
    const labelMetode =
      jenis_pembelian === "saldo" ? "Potongan Saldo" : "Harga Penuh / Tunai";

    // 2. Gabungkan rincian pesanan untuk log deskripsi di riwayat_saldo pembeli
    const deskripsiLengkap = `Belanja (${labelMetode}): ${item_deskripsi || "Produk Skincycle"} | Pembeli: ${profil.username} | Tlp: ${nomor_telepon || "-"} | Alamat: ${alamat_rumah || "-"}`;

    const logRiwayat = await RiwayatSaldo.create(
      {
        id_profil: id_profil,
        id_laporan: null,
        aktivitas: deskripsiLengkap,
        jumlah_saldo: jenis_pembelian === "saldo" ? -nominalPotongSaldo : 0,
        tipe_transaksi: "keluar",
        status: "PENDING",
        tanggal: new Date(),
      },
      { transaction: t },
    );

    // 🚀 FIX MUTLAK 1: Simpan rincian data nomor_telepon & alamat_rumah secara terstruktur ke tabel transaksi_belanja
    await TransaksiBelanja.create(
      {
        id_riwayat: logRiwayat.id_riwayat,
        nomor_telepon: nomor_telepon || "-",
        alamat_rumah: alamat_rumah || "Ambil di Toko",
        jenis_pembelian: jenis_pembelian || "saldo",
      },
      { transaction: t },
    );

    // 🚀 NOTIFIKASI TRIGGER 1: Cari ID Admin untuk mengirimkan notifikasi pemesanan produk baru
    const admin = await Profil.findOne({
      where: { role: "admin" },
      transaction: t,
    });
    if (admin) {
      await Notifikasi.create(
        {
          id_profil_penerima: admin.id_profil,
          id_profil_pengirim: id_profil,
          id_posting: null,
          id_komentar: null,
          id_laporan: null,
          tipe: "pembelian_baru",
          pesan: `Ada pesanan produk baru (${item_deskripsi || "Kosmetik"}) dari customer ${profil.username}. Segera proses di Manajemen Order!`,
          is_read: false,
          tanggal: new Date(),
        },
        { transaction: t },
      );
    }

    await t.commit();
    res.json({
      status: "success",
      message: "Transaksi berhasil dicatat dan admin telah dinotifikasi.",
      data: { total_saldo_sekarang: sisaSaldo },
    });
  } catch (error) {
    await t.rollback();
    console.error("Gagal memproses checkout saldo:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
