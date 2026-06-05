// const { Ensiklopedia } = require("../models");

// exports.getAllArtikel = async (req, res) => {
//   try {
//     const artikel = await Ensiklopedia.findAll({
//       order: [["id_artikel", "DESC"]], // Menampilkan artikel terbaru di urutan teratas
//     });
//     res.json({ status: "success", data: artikel }); // [cite: 16]
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 2. FUNGSI TAMBAH YANG DIPERBAIKI UNTUK MENANGKAP FILE GAMBAR
// exports.createArtikel = async (req, res) => {
//   try {
//     const { judul_artikel, isi_artikel, kategori, status, tanggal_publish } =
//       req.body;

//     // Validasi input dasar [cite: 18]
//     if (!judul_artikel || !isi_artikel || !kategori) {
//       return res.status(400).json({
//         status: "error",
//         message: "Judul, kategori, dan isi konten artikel wajib diisi!",
//       }); // [cite: 18]
//     }

//     // 🆕 Tangkap nama file gambar yang diunggah oleh multer jika ada
//     let namaGambar = null;
//     if (req.file) {
//       namaGambar = req.file.filename; // Mengambil nama file unik hasil generate multer
//     }

//     // Melakukan query insert data ke dalam tabel ensiklopedia [cite: 19]
//     const artikelBaru = await Ensiklopedia.create({
//       judul_artikel,
//       isi_artikel,
//       kategori,
//       gambar: namaGambar,
//       status: status || "Published",
//       tanggal_publish: tanggal_publish || new Date(),
//     });

//     res.status(201).json({

//       status: "success",
//       message: "Artikel edukasi baru berhasil disimpan",
//       data: artikelBaru,
//     });// [cite: 20]
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const { Ensiklopedia } = require("../models");

exports.getAllArtikel = async (req, res) => {
  try {
    const artikel = await Ensiklopedia.findAll({
      order: [["id_artikel", "DESC"]],
    });
    res.json({ status: "success", data: artikel });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createArtikel = async (req, res) => {
  try {
    const { judul_artikel, isi_artikel, kategori, status, tanggal_publish } =
      req.body;

    if (!judul_artikel || !isi_artikel || !kategori) {
      return res.status(400).json({
        status: "error",
        message: "Judul, kategori, dan isi konten artikel wajib diisi!",
      });
    }

    let namaGambar = null;
    if (req.file) {
      namaGambar = req.file.filename;
    }

    const artikelBaru = await Ensiklopedia.create({
      judul_artikel,
      isi_artikel,
      kategori,
      gambar: namaGambar,
      status: status || "Published",
      tanggal_publish: tanggal_publish || new Date(),
    });

    res.status(201).json({
      status: "success",
      message: "Artikel edukasi baru berhasil disimpan",
      data: artikelBaru,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 🆕 TAMBAHKAN FUNGSI UPDATE (PUT)
exports.updateArtikel = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul_artikel, isi_artikel, kategori, status } = req.body;

    // Cari tahu apakah artikelnya ada di database
    const artikel = await Ensiklopedia.findByPk(id);
    if (!artikel) {
      return res
        .status(404)
        .json({ status: "error", message: "Artikel tidak ditemukan!" });
    }

    // Siapkan data yang akan diperbarui
    const dataUpdate = {
      judul_artikel,
      isi_artikel,
      kategori,
      status,
    };

    // Jika admin mengunggah file gambar baru, ganti nama gambarnya
    if (req.file) {
      dataUpdate.gambar = req.file.filename;
    }

    // Eksekusi update ke PostgreSQL via Sequelize
    await artikel.update(dataUpdate);

    res.json({
      status: "success",
      message: "Artikel berhasil diperbarui!",
      data: artikel,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 🆕 TAMBAHKAN FUNGSI DELETE (DELETE)
exports.deleteArtikel = async (req, res) => {
  try {
    const { id } = req.params;
    const artikel = await Ensiklopedia.findByPk(id);

    if (!artikel) {
      return res
        .status(404)
        .json({ status: "error", message: "Artikel tidak ditemukan!" });
    }

    await artikel.destroy();
    res.json({
      status: "success",
      message: "Artikel berhasil dihapus dari database!",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
