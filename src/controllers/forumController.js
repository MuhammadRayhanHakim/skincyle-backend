// const { Forum, Profil, Komentar, ForumLike, Notifikasi } = require("../models");
// const { Op } = require("sequelize");

// // 1. Ambil Semua Postingan (Search & Filter)
// exports.getPosts = async (req, res) => {
//   try {
//     const { search } = req.query;
//     let whereCondition = {};

//     if (search) {
//       const querySearch = `%${search}%`;
//       whereCondition = {
//         [Op.or]: [
//           { judul_posting: { [Op.iLike]: querySearch } },
//           { isi_posting: { [Op.iLike]: querySearch } },
//           { tags: { [Op.iLike]: querySearch } },
//           { kategori: { [Op.iLike]: querySearch } },
//         ],
//       };
//     }

//     const data = await Forum.findAll({
//       where: whereCondition,
//       include: [
//         { model: Profil, as: "penulis", attributes: ["username"] },
//         { model: ForumLike, as: "likes" },
//         {
//           model: Komentar,
//           as: "komentar",
//           include: [
//             { model: Profil, as: "pemberi_komentar", attributes: ["username"] },
//           ],
//         },
//       ],
//       order: [["tanggal_posting", "DESC"]],
//     });
//     res.json({ status: "success", data });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 2. Buat Postingan Baru
// exports.createPost = async (req, res) => {
//   try {
//     const { judul_posting, isi_posting, kategori, tags, anonim, media_url } =
//       req.body;
//     const id_profil = req.user.id_profil;

//     const postinganBaru = await Forum.create({
//       id_profil,
//       judul_posting,
//       isi_posting,
//       kategori,
//       tags,
//       anonim: anonim || false,
//       media_url,
//     });
//     res.status(201).json({ status: "success", data: postinganBaru });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 3. Update Postingan (Edit)
// exports.updatePost = async (req, res) => {
//   try {
//     const { id_posting } = req.params;
//     const { judul_posting, isi_posting, kategori, tags, anonim } = req.body;
//     const id_profil = req.user.id_profil;

//     const post = await Forum.findByPk(id_posting);
//     if (!post)
//       return res
//         .status(404)
//         .json({ status: "error", message: "Postingan tidak ditemukan" });
//     if (post.id_profil !== id_profil)
//       return res
//         .status(403)
//         .json({ status: "error", message: "Akses ditolak" });

//     await post.update({
//       judul_posting: judul_posting || post.judul_posting,
//       isi_posting: isi_posting || post.isi_posting,
//       kategori: kategori || post.kategori,
//       tags: tags || post.tags,
//       anonim: anonim !== undefined ? anonim : post.anonim,
//     });

//     res.json({ status: "success", data: post });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 4. Fitur Like / Upvote + Notifikasi
// exports.toggleLike = async (req, res) => {
//   try {
//     const { id_posting } = req.params;
//     const id_profil = req.user.id_profil;

//     const post = await Forum.findByPk(id_posting);
//     if (!post)
//       return res.status(404).json({ message: "Postingan tidak ditemukan" });

//     const existingLike = await ForumLike.findOne({
//       where: { id_posting, id_profil },
//     });

//     if (existingLike) {
//       await existingLike.destroy();
//       return res.json({ status: "success", message: "Like dihapus" });
//     }

//     await ForumLike.create({ id_posting, id_profil });

//     // Notifikasi dikirim ke PEMILIK postingan
//     if (post.id_profil !== id_profil) {
//       await Notifikasi.create({
//         id_profil_penerima: post.id_profil,
//         id_profil_pengirim: id_profil,
//         tipe: "like",
//         id_posting: id_posting,
//         is_read: false,
//       });
//     }

//     res.json({ status: "success", message: "Berhasil Like" });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 5. Tambah Komentar + SMART NOTIFIKASI (Balasan & Mention)
// exports.addComment = async (req, res) => {
//   try {
//     const { id_posting } = req.params; // Mengambil dari URL /api/forum/comment/:id_posting
//     const { isi_komentar, anonim } = req.body;
//     const id_profil_pengirim = req.user.id_profil;

//     const post = await Forum.findByPk(id_posting);
//     if (!post)
//       return res.status(404).json({ message: "Postingan tidak ditemukan" });

//     // PROSES SIMPAN KE DATABASE
//     const komentarBaru = await Komentar.create({
//       id_posting: id_posting, // Pastikan nama key sesuai dengan kolom di database Anda
//       id_profil: id_profil_pengirim,
//       isi_komentar: isi_komentar,
//       anonim: anonim || false,
//     });

//     // --- LOGIKA NOTIFIKASI ---
//     const mentionMatch = isi_komentar.match(/@(\w+)/);
//     let targetPenerima = post.id_profil;
//     let tipeNotif = "komentar";

//     if (mentionMatch) {
//       const usernameTarget = mentionMatch[1];
//       const profilTarget = await Profil.findOne({
//         where: { username: usernameTarget },
//       });
//       if (profilTarget) {
//         targetPenerima = profilTarget.id_profil;
//         tipeNotif = "balasan";
//       }
//     }

//     if (targetPenerima !== id_profil_pengirim) {
//       await Notifikasi.create({
//         id_profil_penerima: targetPenerima,
//         id_profil_pengirim: id_profil_pengirim,
//         tipe: tipeNotif,
//         id_posting: id_posting,
//         id_komentar: komentarBaru.id_komentar, // Simpan ID komentar untuk navigasi
//         is_read: false,
//       });
//     }

//     res.status(201).json({ status: "success", data: komentarBaru });
//   } catch (error) {
//     console.error("Error Detail:", error); // Munculkan error di terminal backend agar mudah dilacak
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 6. Ambil Detail Postingan
// exports.getPostDetail = async (req, res) => {
//   try {
//     const { id_posting } = req.params;
//     const data = await Forum.findByPk(id_posting, {
//       include: [
//         { model: Profil, as: "penulis", attributes: ["username"] },
//         {
//           model: Komentar,
//           as: "komentar",
//           include: [
//             { model: Profil, as: "pemberi_komentar", attributes: ["username"] },
//           ],
//         },
//       ],
//     });
//     if (!data) return res.status(404).json({ message: "Data tidak ditemukan" });
//     res.json({ status: "success", data });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 7. Hapus Postingan
// exports.deletePost = async (req, res) => {
//   try {
//     const { id_posting } = req.params;
//     const id_profil = req.user.id_profil;
//     const post = await Forum.findByPk(id_posting);

//     if (!post)
//       return res.status(404).json({ message: "Postingan tidak ditemukan" });
//     if (post.id_profil !== id_profil)
//       return res.status(403).json({ message: "Bukan milik Anda" });

//     await post.destroy();
//     res.json({ status: "success", message: "Postingan berhasil dihapus" });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const { Forum, Profil, Komentar, ForumLike, Notifikasi } = require("../models");
const { Op } = require("sequelize");

// 1. Ambil Semua Postingan (Search & Filter) - DIPERBAIKI (Include foto_profil)
exports.getPosts = async (req, res) => {
  try {
    const { search } = req.query;
    let whereCondition = {};

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
      where: whereCondition,
      include: [
        {
          model: Profil,
          as: "penulis",
          attributes: ["username", "foto_profil"], // 🆕 Ditambahkan foto_profil
        },
        { model: ForumLike, as: "likes" },
        {
          model: Komentar,
          as: "komentar",
          include: [
            {
              model: Profil,
              as: "pemberi_komentar",
              attributes: ["username", "foto_profil"], // 🆕 Ditambahkan foto_profil
            },
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
    if (post.id_profil !== id_profil)
      return res
        .status(403)
        .json({ status: "error", message: "Akses ditolak" });

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

// 4. Fitur Like / Upvote + Notifikasi
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

// 5. Tambah Komentar + SMART NOTIFIKASI (Balasan & Mention)
exports.addComment = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const { isi_komentar, anonim } = req.body;
    const id_profil_pengirim = req.user.id_profil;

    const post = await Forum.findByPk(id_posting);
    if (!post)
      return res.status(404).json({ message: "Postingan tidak ditemukan" });

    const komentarBaru = await Komentar.create({
      id_posting: id_posting,
      id_profil: id_profil_pengirim,
      isi_komentar: isi_komentar,
      anonim: anonim || false,
    });

    const mentionMatch = isi_komentar.match(/@(\w+)/);
    let targetPenerima = post.id_profil;
    let tipeNotif = "komentar";

    if (mentionMatch) {
      const usernameTarget = mentionMatch[1];
      const profilTarget = await Profil.findOne({
        where: { username: usernameTarget },
      });
      if (profilTarget) {
        targetPenerima = profilTarget.id_profil;
        tipeNotif = "balasan";
      }
    }

    if (targetPenerima !== id_profil_pengirim) {
      await Notifikasi.create({
        id_profil_penerima: targetPenerima,
        id_profil_pengirim: id_profil_pengirim,
        tipe: tipeNotif,
        id_posting: id_posting,
        id_komentar: komentarBaru.id_komentar,
        is_read: false,
      });
    }

    res.status(201).json({ status: "success", data: komentarBaru });
  } catch (error) {
    console.error("Error Detail:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 6. Ambil Detail Postingan - DIPERBAIKI (Include foto_profil)
exports.getPostDetail = async (req, res) => {
  try {
    const { id_posting } = req.params;
    const data = await Forum.findByPk(id_posting, {
      include: [
        {
          model: Profil,
          as: "penulis",
          attributes: ["username", "foto_profil"], // 🆕 Ditambahkan foto_profil
        },
        {
          model: Komentar,
          as: "komentar",
          include: [
            {
              model: Profil,
              as: "pemberi_komentar",
              attributes: ["username", "foto_profil"], // 🆕 Ditambahkan foto_profil
            },
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
