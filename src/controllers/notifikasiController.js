const { Notifikasi, Profil } = require("../models");

// 1. Ambil semua notifikasi untuk user yang login
exports.getNotifikasi = async (req, res) => {
  try {
    const id_profil = req.user.id_profil;
    const data = await Notifikasi.findAll({
      where: { id_profil_penerima: id_profil },
      include: [{ model: Profil, as: "pengirim", attributes: ["username"] }],
      order: [["tanggal", "DESC"]],
    });
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. Hitung jumlah notifikasi yang belum dibaca
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notifikasi.count({
      where: { id_profil_penerima: req.user.id_profil, is_read: false },
    });
    res.json({ status: "success", count });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 3. Tandai semua notifikasi sebagai sudah dibaca
exports.markAsRead = async (req, res) => {
  try {
    await Notifikasi.update(
      { is_read: true },
      { where: { id_profil_penerima: req.user.id_profil, is_read: false } },
    );
    res.json({ status: "success", message: "Notifikasi dibaca" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
