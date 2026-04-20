const { Forum, Profil, Komentar } = require("../models");

// 1. Ambil Semua Postingan
exports.getPosts = async (req, res) => {
  try {
    const data = await Forum.findAll({
      include: [{ model: Profil, attributes: ["username"] }],
      order: [["createdAt", "DESC"]], // Tambahkan ini agar yang terbaru di atas
    });
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. Buat Postingan Baru
exports.createPost = async (req, res) => {
  try {
    // Pastikan variabel di kiri (judul_posting) SAMA DENGAN yang dikirim Postman
    const { judul_posting, isi_posting, kategori } = req.body;
    const id_profil = req.user.id_profil;

    const postinganBaru = await Forum.create({
      id_profil,
      judul_posting, // Gunakan variabel yang benar di sini
      isi_posting,
      kategori,
    });

    res.status(201).json({ status: "success", data: postinganBaru });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 3. Detail Postingan & Komentar (INI YANG TADI BIKIN ERROR)
exports.getPostDetail = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const data = await Forum.findByPk(id_posting, {
      include: [
        { model: Profil, attributes: ["username"] },
        {
          model: Komentar,
          include: [{ model: Profil, attributes: ["username"] }],
        },
      ],
    });

    if (!data) {
      return res
        .status(404)
        .json({ status: "error", message: "Postingan tidak ditemukan" });
    }

    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 4. Tambah Komentar (INI JUGA WAJIB ADA)
exports.addComment = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const { isi_komentar } = req.body;
    const id_profil = req.user.id_profil;

    const komentarBaru = await Komentar.create({
      id_posting,
      id_profil,
      isi_komentar,
    });

    res.status(201).json({ status: "success", data: komentarBaru });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 5. Hapus Postingan (Hanya pemilik yang bisa)
exports.deletePost = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const id_profil = req.user.id_profil;

    const postingan = await Forum.findByPk(id_posting);

    if (!postingan)
      return res.status(404).json({ message: "Post tidak ditemukan" });

    // Cek apakah yang menghapus adalah pemiliknya
    if (postingan.id_profil !== id_profil) {
      return res
        .status(403)
        .json({ message: "Anda tidak punya izin menghapus post ini" });
    }

    await postingan.destroy();
    res.json({ status: "success", message: "Postingan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
