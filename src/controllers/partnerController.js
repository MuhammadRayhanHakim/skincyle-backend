const {
  Stakeholder,
  Produk,
  Profil,
  RiwayatSaldo, // Gunakan model RiwayatSaldo yang baru
  sequelize,
} = require("../models");

// 1. Ambil semua Brand Partner & Katalog Produknya
// Berguna untuk menampilkan daftar produk di marketplace SkinCycle
exports.getPartners = async (req, res) => {
  try {
    const partners = await Stakeholder.findAll({
      include: [{ model: Produk }],
    });
    res.status(200).json({ status: "success", data: partners });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. LOGIKA INTI: Pembelian Produk & Potong Saldo Otomatis
exports.checkoutProduk = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id_produk, jumlah_beli } = req.body;
    const id_profil = req.user.id_profil;

    // 1. Cari data produk dan profil user
    const produk = await Produk.findByPk(id_produk);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    const userProfil = await Profil.findByPk(id_profil);

    // 2. Hitung Total Harga
    const totalHargaAsli = produk.harga * (jumlah_beli || 1);

    // 3. Kalkulasi Potongan Saldo
    // Jika saldo user > 0, gunakan saldo untuk memotong harga
    let potonganSaldo = 0;
    if (userProfil.total_saldo > 0) {
      // Gunakan semua saldo jika saldo < total harga,
      // atau gunakan sebagian saldo jika saldo > total harga
      potonganSaldo = Math.min(userProfil.total_saldo, totalHargaAsli);
    }

    const hargaAkhir = totalHargaAsli - potonganSaldo;

    // 4. Eksekusi Perubahan Saldo (Atomic Operation)
    if (potonganSaldo > 0) {
      // Kurangi saldo di tabel Profil
      await userProfil.decrement("total_saldo", {
        by: potonganSaldo,
        transaction: t,
      });

      // Catat riwayat saldo sebagai transaksi "keluar"
      await RiwayatSaldo.create(
        {
          id_profil,
          aktivitas: `Potongan Harga: ${produk.nama_produk}`,
          jumlah_saldo: potonganSaldo,
          tipe_transaksi: "keluar",
          tanggal: new Date(),
        },
        { transaction: t },
      );
    }

    // Jika sampai sini tidak ada error, simpan semua ke Database
    await t.commit();

    res.status(200).json({
      status: "success",
      message: "Pembelian berhasil diproses dengan potongan saldo",
      data: {
        nama_produk: produk.nama_produk,
        total_belanja: totalHargaAsli,
        potongan_saldo: potonganSaldo,
        sisa_bayar_tunai: hargaAkhir,
        sisa_saldo_user: userProfil.total_saldo - potonganSaldo,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 3. Ambil Detail Satu Produk (Optional)
exports.getProdukDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const produk = await Produk.findByPk(id, {
      include: [Stakeholder],
    });
    res.status(200).json({ status: "success", data: produk });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
