const { Forum, Profil, Komentar, ForumLike, Notifikasi } = require("../models");
const { Op } = require("sequelize");

exports.getPosts = async (req, res) => {
  try {
    const { search } = req.query; // Menangkap kata kunci dari URL (?search=...)

    let whereCondition = {};

    // Jika user sedang mencari sesuatu
    if (search) {
      const querySearch = `%${search}%`;
      whereCondition = {
        [Op.or]: [
          { judul_posting: { [Op.iLike]: querySearch } },
          { isi_posting: { [Op.iLike]: querySearch } },
          { tags: { [Op.iLike]: querySearch } },
          { kategori: { [Op.iLike]: querySearch } },
        ],
      };
    }

    const data = await Forum.findAll({
      where: whereCondition, // Terapkan penyaringan di sini
      include: [
        { model: Profil, as: "penulis", attributes: ["username"] },
        { model: ForumLike, as: "likes" },
        {
          model: Komentar,
          as: "komentar",
          include: [
            { model: Profil, as: "pemberi_komentar", attributes: ["username"] },
          ],
        },
      ],
      order: [["tanggal_posting", "DESC"]],
    });
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. Buat Postingan Baru
exports.createPost = async (req, res) => {
  try {
    const { judul_posting, isi_posting, kategori, tags, anonim, media_url } =
      req.body;
    const id_profil = req.user.id_profil;

    const postinganBaru = await Forum.create({
      id_profil,
      judul_posting,
      isi_posting,
      kategori,
      tags,
      anonim: anonim || false,
      media_url,
    });
    res.status(201).json({ status: "success", data: postinganBaru });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 3. Update Postingan (Edit)
exports.updatePost = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const { judul_posting, isi_posting, kategori, tags, anonim } = req.body;
    const id_profil = req.user.id_profil;

    const post = await Forum.findByPk(id_posting);
    if (!post)
      return res
        .status(404)
        .json({ status: "error", message: "Postingan tidak ditemukan" });

    if (post.id_profil !== id_profil) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses untuk mengedit ini",
      });
    }

    await post.update({
      judul_posting: judul_posting || post.judul_posting,
      isi_posting: isi_posting || post.isi_posting,
      kategori: kategori || post.kategori,
      tags: tags || post.tags,
      anonim: anonim !== undefined ? anonim : post.anonim,
    });

    res.json({ status: "success", data: post });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 4. Fitur Like / Upvote + TRIGGER NOTIFIKASI
exports.toggleLike = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const id_profil = req.user.id_profil;

    const post = await Forum.findByPk(id_posting);
    if (!post)
      return res.status(404).json({ message: "Postingan tidak ditemukan" });

    const existingLike = await ForumLike.findOne({
      where: { id_posting, id_profil },
    });

    if (existingLike) {
      await existingLike.destroy();
      return res.json({ status: "success", message: "Like dihapus" });
    }

    await ForumLike.create({ id_posting, id_profil });

    // --- LOGIKA NOTIFIKASI LIKE ---
    // Notifikasi dikirim ke PEMILIK postingan (post.id_profil)
    if (post.id_profil !== id_profil) {
      await Notifikasi.create({
        id_profil_penerima: post.id_profil,
        id_profil_pengirim: id_profil,
        tipe: "like",
        id_posting: id_posting,
        is_read: false,
      });
    }

    res.json({ status: "success", message: "Berhasil Like" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 5. Tambah Komentar + TRIGGER NOTIFIKASI
exports.addComment = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const { isi_komentar, anonim } = req.body;
    const id_profil = req.user.id_profil;

    const post = await Forum.findByPk(id_posting);
    if (!post)
      return res.status(404).json({ message: "Postingan tidak ditemukan" });

    const komentarBaru = await Komentar.create({
      id_posting,
      id_profil,
      isi_komentar,
      anonim: anonim || false,
    });

    // --- LOGIKA NOTIFIKASI KOMENTAR ---
    if (post.id_profil !== id_profil) {
      await Notifikasi.create({
        id_profil_penerima: post.id_profil,
        id_profil_pengirim: id_profil,
        tipe: "komentar",
        id_posting: id_posting,
        is_read: false,
      });
    }

    res.status(201).json({ status: "success", data: komentarBaru });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 6. Ambil Detail Postingan tunggal
exports.getPostDetail = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const data = await Forum.findByPk(id_posting, {
      include: [
        { model: Profil, as: "penulis", attributes: ["username"] },
        {
          model: Komentar,
          as: "komentar",
          include: [
            { model: Profil, as: "pemberi_komentar", attributes: ["username"] },
          ],
        },
      ],
    });
    if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 7. Hapus Postingan
exports.deletePost = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const id_profil = req.user.id_profil;
    const post = await Forum.findByPk(id_posting);

    if (!post)
      return res.status(404).json({ message: "Postingan tidak ditemukan" });
    if (post.id_profil !== id_profil)
      return res.status(403).json({ message: "Bukan milik Anda" });

    await post.destroy();
    res.json({ status: "success", message: "Postingan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
