// const Kandungan = require("../models/Kandungan");
// const { Op } = require("sequelize");

// // GET: Mengambil semua kandungan dengan filter pencarian (User & Admin)
// exports.getKandungan = async (req, res) => {
//   try {
//     const { q } = req.query;
//     let queryOptions = { order: [["id_kandungan", "DESC"]] };

//     if (q) {
//       queryOptions.where = {
//         nama_kandungan: {
//           [Op.iLike]: `%${q}%`,
//         },
//       };
//     }

//     const data = await Kandungan.findAll(queryOptions);
//     return res.json({ status: "success", data });
//   } catch (error) {
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // POST: Admin Menambahkan Kandungan Baru ke Database
// exports.createKandungan = async (req, res) => {
//   try {
//     const {
//       nama_kandungan,
//       fungsi,
//       manfaat,
//       efek_samping,
//       jenis_kulit_cocok,
//       kategori_bahan,
//       status_publikasi,
//     } = req.body;

//     const gambar = req.file ? req.file.filename : "default-ing.jpg";

//     const kandunganBaru = await Kandungan.create({
//       nama_kandungan,
//       fungsi,
//       manfaat,
//       efek_samping,
//       jenis_kulit_cocok,
//       kategori_bahan: kategori_bahan || "Semua",
//       status_publikasi: status_publikasi || "Published",
//       gambar_bahan: gambar,
//     });

//     return res.status(201).json({
//       status: "success",
//       message: "Bahan kandungan baru berhasil disimpan!",
//       data: kandunganBaru,
//     });
//   } catch (error) {
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // PUT: Admin Mengubah/Edit Bahan Kandungan
// exports.updateKandungan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const kandungan = await Kandungan.findByPk(id);
//     if (!kandungan) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Bahan tidak ditemukan" });
//     }

//     const {
//       nama_kandungan,
//       fungsi,
//       manfaat,
//       efek_samping,
//       jenis_kulit_cocok,
//       kategori_bahan,
//       status_publikasi,
//     } = req.body;

//     const dataUpdate = {
//       nama_kandungan: nama_kandungan || kandungan.nama_kandungan,
//       fungsi: fungsi || kandungan.fungsi,
//       manfaat: manfaat || kandungan.manfaat,
//       efek_samping: efek_samping || kandungan.efek_samping,
//       jenis_kulit_cocok: jenis_kulit_cocok || kandungan.jenis_kulit_cocok,
//       kategori_bahan: kategori_bahan || kandungan.kategori_bahan,
//       status_publikasi: status_publikasi || kandungan.status_publikasi,
//     };

//     if (req.file) dataUpdate.gambar_bahan = req.file.filename;

//     await kandungan.update(dataUpdate);
//     return res.json({
//       status: "success",
//       message: "Bahan kandungan berhasil diperbarui!",
//     });
//   } catch (error) {
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

const Kandungan = require("../models/Kandungan");
const { Op } = require("sequelize");

// GET: Mengambil semua kandungan dengan filter pencarian (User & Admin)
exports.getKandungan = async (req, res) => {
  try {
    // PERBAIKAN: Menangkap parameter 'search' (dari user) atau 'q' (dari admin) agar pencarian di galeri berfungsi
    const { search, q } = req.query;
    const keyword = search || q;
    let queryOptions = { order: [["id_kandungan", "DESC"]] };

    if (keyword) {
      const querySearch = `%${keyword}%`;
      queryOptions.where = {
        [Op.or]: [
          { nama_kandungan: { [Op.iLike]: querySearch } },
          { fungsi: { [Op.iLike]: querySearch } },
          { manfaat: { [Op.iLike]: querySearch } },
        ],
      };
    }

    const data = await Kandungan.findAll(queryOptions);
    return res.json({ status: "success", data });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// POST: Admin Menambahkan Kandungan Baru ke Database
exports.createKandungan = async (req, res) => {
  try {
    const {
      nama_kandungan,
      fungsi,
      manfaat,
      efek_samping,
      jenis_kulit_cocok,
      kategori_bahan,
      status_publikasi,
    } = req.body;

    const gambar = req.file ? req.file.filename : "default-ing.jpg";

    const kandunganBaru = await Kandungan.create({
      nama_kandungan,
      fungsi,
      manfaat,
      efek_samping,
      jenis_kulit_cocok,
      kategori_bahan: kategori_bahan || "Semua",
      status_publikasi: status_publikasi || "Published",
      gambar_bahan: gambar,
    });

    return res.status(201).json({
      status: "success",
      message: "Bahan kandungan baru berhasil disimpan!",
      data: kandunganBaru,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT: Admin Mengubah/Edit Bahan Kandungan
exports.updateKandungan = async (req, res) => {
  try {
    const { id } = req.params;
    const kandungan = await Kandungan.findByPk(id);
    if (!kandungan) {
      return res
        .status(404)
        .json({ status: "error", message: "Bahan tidak ditemukan" });
    }

    const {
      nama_kandungan,
      fungsi,
      manfaat,
      efek_samping,
      jenis_kulit_cocok,
      kategori_bahan,
      status_publikasi,
    } = req.body;

    const dataUpdate = {
      nama_kandungan: nama_kandungan || kandungan.nama_kandungan,
      fungsi: fungsi || kandungan.fungsi,
      manfaat: manfaat || kandungan.manfaat,
      efek_samping: efek_samping || kandungan.efek_samping,
      jenis_kulit_cocok: jenis_kulit_cocok || kandungan.jenis_kulit_cocok,
      kategori_bahan: kategori_bahan || kandungan.kategori_bahan,
      status_publikasi: status_publikasi || kandungan.status_publikasi,
    };

    if (req.file) dataUpdate.gambar_bahan = req.file.filename;

    await kandungan.update(dataUpdate);
    return res.json({
      status: "success",
      message: "Bahan kandungan berhasil diperbarui!",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// PERBAIKAN UTAMA: Tambahkan fungsi deleteKandungan di bawah ini
exports.deleteKandungan = async (req, res) => {
  try {
    const { id } = req.params;
    const kandungan = await Kandungan.findByPk(id);

    if (!kandungan) {
      return res.status(404).json({
        status: "error",
        message: "Bahan kandungan tidak ditemukan atau telah dihapus.",
      });
    }

    // Hapus data secara permanen dari tabel database PostgreSQL Anda
    await kandungan.destroy();

    return res.json({
      status: "success",
      message: "Bahan kandungan berhasil dihapus secara permanen!",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
