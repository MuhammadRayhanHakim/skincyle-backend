const {
  Stakeholder,
  Produk,
  VoucherReward,
  RedeemTransaction,
  Profil,
  RiwayatPoin,
  sequelize, // Import sequelize untuk fitur Transaction
} = require("../models");
const { v4: uuidv4 } = require("uuid");

// 1. Ambil semua Brand Partner & Katalog Produknya
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

// 2. Ambil Daftar Voucher yang tersedia
exports.getRewards = async (req, res) => {
  try {
    const rewards = await VoucherReward.findAll({
      include: [
        { model: Stakeholder, attributes: ["nama_brand", "logo_brand"] },
      ],
    });
    res.status(200).json({ status: "success", data: rewards });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 3. LOGIKA INTI: Tukar Poin (Redeem Voucher) dengan Transaction
exports.redeemVoucher = async (req, res) => {
  // Gunakan Transaction agar jika salah satu gagal, semua dibatalkan (Data Integrity)
  const t = await sequelize.transaction();

  try {
    const { id_voucher } = req.body;
    const id_profil = req.user.id_profil;

    // 1. Cek validitas voucher
    const voucher = await VoucherReward.findByPk(id_voucher);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher tidak ditemukan" });
    }

    // 2. Cek poin user
    const userProfil = await Profil.findByPk(id_profil);
    if (userProfil.total_poin < voucher.poin_dibutuhkan) {
      await t.rollback();
      return res.status(400).json({
        status: "fail",
        message: `Poin tidak cukup. Butuh ${voucher.poin_dibutuhkan} poin.`,
      });
    }

    // 3. Eksekusi Perubahan Data (Atomic Operation)

    // Kurangi poin
    await userProfil.decrement("total_poin", {
      by: voucher.poin_dibutuhkan,
      transaction: t,
    });

    // Generate kode unik yang lebih profesional dengan UUID (diambil 8 digit terakhir)
    const kodeUnik = `SKIN-${uuidv4().split("-")[0].toUpperCase()}`;

    // Simpan transaksi redeem
    const transaksi = await RedeemTransaction.create(
      {
        id_profil,
        id_voucher,
        kode_unik_redeem: kodeUnik,
        status_pakai: false,
      },
      { transaction: t },
    );

    // Catat riwayat poin
    await RiwayatPoin.create(
      {
        id_profil,
        jumlah_poin: -voucher.poin_dibutuhkan,
        keterangan: `Tukar Voucher: ${voucher.nama_voucher}`,
      },
      { transaction: t },
    );

    // Jika sampai sini tidak ada error, simpan semua ke Database
    await t.commit();

    res.status(201).json({
      status: "success",
      message: "Voucher berhasil ditukarkan!",
      data: {
        kode_voucher: kodeUnik,
        sisa_poin: userProfil.total_poin - voucher.poin_dibutuhkan,
      },
    });
  } catch (error) {
    // Jika ada error di tengah jalan, batalkan semua perubahan poin
    await t.rollback();
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 4. API Tambahan: Ambil Voucher Saya (Untuk Riwayat di React)
exports.getMyVouchers = async (req, res) => {
  try {
    const id_profil = req.user.id_profil;
    const myVouchers = await RedeemTransaction.findAll({
      where: { id_profil },
      include: [
        {
          model: VoucherReward,
          include: [
            { model: Stakeholder, attributes: ["nama_brand", "logo_brand"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ status: "success", data: myVouchers });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
