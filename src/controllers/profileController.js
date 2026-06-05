const Profil = require("../models/Profil"); // Pastikan path model sesuai

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profil = await Profil.findByPk(id);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }
    res.json({ status: "success", data: profil });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 🆕 FUNGSI PUT: MENYIMPAN PERUBAHAN PROFIL & AVATAR BARU
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio } = req.body;

    const profil = await Profil.findByPk(id);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    // Susun objek data yang ingin di-update
    const updatedData = {
      username: username || profil.username,
      bio: bio !== undefined ? bio : profil.bio,
    };

    // Jika admin/user mengunggah berkas foto baru lewat Multer
    if (req.file) {
      updatedData.foto_profil = req.file.filename;
    }

    // Eksekusi pembaruan ke database PostgreSQL
    await profil.update(updatedData);

    res.json({
      status: "success",
      message: "Profil berhasil diperbarui!",
      data: profil,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.deletePhotoProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari data berdasarkan Primary Key id_profil
    const profil = await Profil.findByPk(id);
    if (!profil) {
      return res.status(404).json({
        status: "error",
        message: "Profil gagal ditemukan di sistem database.",
      });
    }

    // Ubah nilai kolom foto_profil kembali menjadi null (kosong) di database PostgreSQL
    await profil.update({ foto_profil: null });

    res.json({
      status: "success",
      message: "Foto profil berhasil dihapus dari database!",
      data: profil,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
