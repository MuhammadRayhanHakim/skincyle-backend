// const { Produk } = require("../models");

// // --- 1. USER & ADMIN: AMBIL SEMUA PRODUK (GET) ---
// exports.getAllProduk = async (req, res) => {
//   try {
//     const data = await Produk.findAll({
//       order: [["id_produk", "DESC"]],
//     });
//     return res.json({ status: "success", data });
//   } catch (error) {
//     console.error("Error getAllProduk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 2. USER: AMBIL LENGKAP DETAIL PRODUK BERDASARKAN ID (GET) ---
// // --- FUNGSI INI YANG SEBELUMNYA HILANG DAN MENYEBABKAN CRASH ---
// exports.getProdukById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = await Produk.findByPk(id);

//     if (!data) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Produk tidak ditemukan." });
//     }

//     return res.json({ status: "success", data });
//   } catch (error) {
//     console.error("Error getProdukById:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 3. ADMIN: TAMBAH PRODUK BARU (POST) ---
// exports.createProduk = async (req, res) => {
//   try {
//     const { name, category, skinType, price, brand, description, benefits } =
//       req.body;

//     // Ambil nama file dari multi-upload multer fields
//     const img1 = req.files?.["image1"]
//       ? req.files["image1"][0].filename
//       : "default.jpg";
//     const img2 = req.files?.["image2"] ? req.files["image2"][0].filename : null;
//     const img3 = req.files?.["image3"] ? req.files["image3"][0].filename : null;
//     const img4 = req.files?.["image4"] ? req.files["image4"][0].filename : null;

//     // Gabungkan gambar aktif menggunakan pemisah koma
//     const gabungGambar = [img1, img2, img3, img4].filter(Boolean).join(",");

//     const produkBaru = await Produk.create({
//       nama_produk: name,
//       kategori: category || "Semua",
//       brand: brand || "SkinCycle",
//       deskripsi_produk: description || "",
//       suitable_skin_type: skinType || "Semua",
//       harga_asli: price ? parseInt(price) : 0,
//       gambar_produk: gabungGambar,
//       link_pembelian: benefits || "#",
//     });

//     return res.status(201).json({
//       status: "success",
//       message: "Produk berhasil ditambahkan!",
//       data: produkBaru,
//     });
//   } catch (error) {
//     console.error("Gagal menambah produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 4. ADMIN: EDIT PRODUK (PUT) ---
// exports.updateProduk = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, category, skinType, price, brand, description, benefits } =
//       req.body;

//     const produk = await Produk.findByPk(id);
//     if (!produk) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Produk tidak ditemukan." });
//     }

//     const dataUpdate = {
//       nama_produk: name || produk.nama_produk,
//       kategori: category || produk.kategori,
//       brand: brand || produk.brand,
//       deskripsi_produk: description || produk.deskripsi_produk,
//       suitable_skin_type: skinType || produk.suitable_skin_type,
//       harga_asli: price ? parseInt(price) : produk.harga_asli,
//       link_pembelian: benefits || produk.link_pembelian,
//     };

//     if (req.files && Object.keys(req.files).length > 0) {
//       const img1 = req.files?.["image1"]
//         ? req.files["image1"][0].filename
//         : null;
//       const img2 = req.files?.["image2"]
//         ? req.files["image2"][0].filename
//         : null;
//       const img3 = req.files?.["image3"]
//         ? req.files["image3"][0].filename
//         : null;
//       const img4 = req.files?.["image4"]
//         ? req.files["image4"][0].filename
//         : null;

//       const gabungGambar = [img1, img2, img3, img4].filter(Boolean).join(",");
//       if (gabungGambar) dataUpdate.gambar_produk = gabungGambar;
//     }

//     await Produk.update(dataUpdate, { where: { id_produk: id } });

//     return res.json({
//       status: "success",
//       message: "Produk diperbarui!",
//       data: dataUpdate,
//     });
//   } catch (error) {
//     console.error("Gagal memperbarui produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 5. ADMIN: HAPUS PRODUK (DELETE) ---
// exports.deleteProduk = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Produk.destroy({ where: { id_produk: id } });
//     return res.json({ status: "success", message: "Produk berhasil dihapus" });
//   } catch (error) {
//     console.error("Gagal menghapus produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// const { Produk } = require("../models");

// // --- 1. USER & ADMIN: AMBIL SEMUA PRODUK (GET) ---
// exports.getAllProduk = async (req, res) => {
//   try {
//     const data = await Produk.findAll({
//       order: [["id_produk", "DESC"]],
//     });
//     return res.json({ status: "success", data }); // Loloskan data ke frontend
//   } catch (error) {
//     console.error("Error getAllProduk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 2. USER: AMBIL LENGKAP DETAIL PRODUK BERDASARKAN ID (GET) ---
// exports.getProdukById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = await Produk.findByPk(id);

//     if (!data) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Produk tidak ditemukan." });
//     }

//     return res.json({ status: "success", data });
//   } catch (error) {
//     console.error("Error getProdukById:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 3. ADMIN: TAMBAH PRODUK BARU (POST) ---
// exports.createProduk = async (req, res) => {
//   try {
//     const {
//       name,
//       category,
//       skinType,
//       price,
//       brand,
//       description,
//       benefits,
//       ingredients,
//     } = req.body;

//     // Menampung nama file gambar dari upload fields Multer
//     const img1 = req.files?.["image1"]
//       ? req.files["image1"][0].filename
//       : "default.jpg";
//     const img2 = req.files?.["image2"] ? req.files["image2"][0].filename : null;
//     const img3 = req.files?.["image3"] ? req.files["image3"][0].filename : null;
//     const img4 = req.files?.["image4"] ? req.files["image4"][0].filename : null;

//     // Gabungkan gambar aktif menggunakan pemisah koma
//     const gabungGambar = [img1, img2, img3, img4].filter(Boolean).join(",");

//     const produkBaru = await Produk.create({
//       nama_produk: name,
//       kategori: category || "Semua",
//       brand: brand || "SkinCycle",
//       deskripsi_produk: description || "",
//       suitable_skin_type: skinType || "Semua",
//       harga_asli: price ? parseInt(price) : 0,
//       gambar_produk: gabungGambar,
//       link_pembelian: benefits || "#", // Menyimpan manfaat utama (koma)
//       bahan_kandungan: ingredients || "", // === SINKRONISASI FIELD BARU ===
//     });

//     return res.status(201).json({
//       status: "success",
//       message: "Produk berhasil ditambahkan!",
//       data: produkBaru,
//     });
//   } catch (error) {
//     console.error("Gagal menambah produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 4. ADMIN: EDIT PRODUK (PUT) ---
// exports.updateProduk = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       name,
//       category,
//       skinType,
//       price,
//       brand,
//       description,
//       benefits,
//       ingredients,
//     } = req.body;

//     const produk = await Produk.findByPk(id);
//     if (!produk) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Produk tidak ditemukan." });
//     }

//     const dataUpdate = {
//       nama_produk: name || produk.nama_produk,
//       kategori: category || produk.kategori,
//       brand: brand || produk.brand,
//       deskripsi_produk: description || produk.deskripsi_produk,
//       suitable_skin_type: skinType || produk.suitable_skin_type,
//       harga_asli: price ? parseInt(price) : produk.harga_asli,
//       link_pembelian: benefits || produk.link_pembelian,
//       bahan_kandungan: ingredients || produk.bahan_kandungan, // === SINKRONISASI FIELD BARU ===
//     };

//     if (req.files && Object.keys(req.files).length > 0) {
//       const img1 = req.files?.["image1"]
//         ? req.files["image1"][0].filename
//         : null;
//       const img2 = req.files?.["image2"]
//         ? req.files["image2"][0].filename
//         : null;
//       const img3 = req.files?.["image3"]
//         ? req.files["image3"][0].filename
//         : null;
//       const img4 = req.files?.["image4"]
//         ? req.files["image4"][0].filename
//         : null;

//       const gabungGambar = [img1, img2, img3, img4].filter(Boolean).join(",");
//       if (gabungGambar) dataUpdate.gambar_produk = gabungGambar;
//     }

//     await Produk.update(dataUpdate, { where: { id_produk: id } });
//     return res.json({
//       status: "success",
//       message: "Produk diperbarui!",
//       data: dataUpdate,
//     });
//   } catch (error) {
//     console.error("Gagal memperbarui produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 5. ADMIN: HAPUS PRODUK (DELETE) ---
// exports.deleteProduk = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Produk.destroy({ where: { id_produk: id } });
//     return res.json({ status: "success", message: "Produk berhasil dihapus" });
//   } catch (error) {
//     console.error("Gagal menghapus produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };
const { Produk } = require("../models");

// --- 1. USER & ADMIN: AMBIL SEMUA PRODUK (GET) ---
exports.getAllProduk = async (req, res) => {
  try {
    const data = await Produk.findAll({
      order: [["id_produk", "DESC"]],
    });
    return res.json({ status: "success", data });
  } catch (error) {
    console.error("Error getAllProduk:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 2. USER: AMBIL LENGKAP DETAIL PRODUK BY ID (GET) ---
exports.getProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Produk.findByPk(id);
    if (!data) {
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan." });
    }
    return res.json({ status: "success", data });
  } catch (error) {
    console.error("Error getProdukById:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 3. ADMIN: TAMBAH PRODUK BARU (POST) ---
exports.createProduk = async (req, res) => {
  try {
    const {
      name,
      category,
      skinType,
      price,
      brand,
      description,
      benefits,
      ingredients,
      skinOily,
      skinDry,
      skinKombinasi,
      skinSensitif,
    } = req.body;

    const img1 = req.files?.["image1"]
      ? req.files["image1"][0].filename
      : "default.jpg";
    const img2 = req.files?.["image2"] ? req.files["image2"][0].filename : null;
    const img3 = req.files?.["image3"] ? req.files["image3"][0].filename : null;
    const img4 = req.files?.["image4"] ? req.files["image4"][0].filename : null;
    const gabungGambar = [img1, img2, img3, img4].filter(Boolean).join(",");

    // Menggabungkan data persentase kulit menjadi string tunggal (Format: Oily,Dry,Kombinasi,Sensitif)
    const gabungKecocokan = [
      skinOily || 50,
      skinDry || 50,
      skinKombinasi || 50,
      skinSensitif || 50,
    ].join(",");

    const produkBaru = await Produk.create({
      nama_produk: name,
      kategori: category || "Semua",
      brand: brand || "SkinCycle",
      deskripsi_produk: description || "",
      suitable_skin_type: skinType || "Semua",
      harga_asli: price ? parseInt(price) : 0,
      gambar_produk: gabungGambar,
      link_pembelian: benefits || "#", // Kolom manfaat utama
      bahan_kandungan: ingredients || "", // Kolom bahan kandungan analisis
      ph_level: parseFloat(gabungKecocokan) || 0, // Kita manfaatkan kolom ph_level atau buat kolom baru untuk kecocokan kulit
    });

    return res
      .status(201)
      .json({
        status: "success",
        message: "Produk berhasil ditambahkan!",
        data: produkBaru,
      });
  } catch (error) {
    console.error("Gagal menambah produk:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 4. ADMIN: EDIT PRODUK (PUT) ---
exports.updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      skinType,
      price,
      brand,
      description,
      benefits,
      ingredients,
      skinOily,
      skinDry,
      skinKombinasi,
      skinSensitif,
    } = req.body;

    const produk = await Produk.findByPk(id);
    if (!produk) {
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan." });
    }

    const gabungKecocokan = [
      skinOily,
      skinDry,
      skinKombinasi,
      skinSensitif,
    ].join(",");

    const dataUpdate = {
      nama_produk: name || produk.nama_produk,
      kategori: category || p.kategori,
      brand: brand || produk.brand,
      deskripsi_produk: description || produk.deskripsi_produk,
      suitable_skin_type: skinType || produk.suitable_skin_type,
      harga_asli: price ? parseInt(price) : produk.harga_asli,
      link_pembelian: benefits || produk.link_pembelian,
      bahan_kandungan: ingredients || produk.bahan_kandungan,
      ph_level: gabungKecocokan !== ",,," ? gabungKecocokan : produk.ph_level,
    };

    if (req.files && Object.keys(req.files).length > 0) {
      const img1 = req.files?.["image1"]
        ? req.files["image1"][0].filename
        : null;
      const img2 = req.files?.["image2"]
        ? req.files["image2"][0].filename
        : null;
      const img3 = req.files?.["image3"]
        ? req.files["image3"][0].filename
        : null;
      const img4 = req.files?.["image4"]
        ? req.files["image4"][0].filename
        : null;
      const gabungGambar = [img1, img2, img3, img4].filter(Boolean).join(",");
      if (gabungGambar) dataUpdate.gambar_produk = gabungGambar;
    }

    await Produk.update(dataUpdate, { where: { id_produk: id } });
    return res.json({ status: "success", message: "Produk diperbarui!" });
  } catch (error) {
    console.error("Gagal memperbarui produk:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 5. ADMIN: HAPUS PRODUK (DELETE) ---
exports.deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;
    await Produk.destroy({ where: { id_produk: id } });
    return res.json({ status: "success", message: "Produk berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
