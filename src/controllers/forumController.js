const { Forum, Profil } = require("../models");

exports.createPost = async (req, res) => {
  try {
    const { id_profil, judul_posting, isi_posting, kategori } = req.body;

    // Pastikan kolom ini ada di database Anda
    const post = await Forum.create({
      id_profil,
      judul_posting,
      isi_posting,
      kategori,
    });

    res.status(201).json({ status: "success", data: post, message: "ok" });
  } catch (error) {
    // Gunakan 400 untuk error validasi/input
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Forum.findAll({
      // include ini akan error jika relasi di models/index.js belum dibuat
      include: [{ model: Profil, attributes: ["username"] }],
    });
    res.json({ status: "success", data: posts, message: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
