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

// --- 3. ADMIN: TAMBAH PRODUK BARU (POST) - FIXED ---
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

    // Menangani pembacaan file gambar baik menggunakan upload.single("gambar_produk") maupun fields
    let gambar = "default.jpg";
    if (req.file) {
      gambar = req.file.filename;
    } else if (req.files?.["gambar_produk"]) {
      gambar = req.files["gambar_produk"][0].filename;
    } else if (req.files?.["image1"]) {
      gambar = req.files["image1"][0].filename;
    }

    // Menggabungkan data persentase kulit menjadi string tunggal
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
      gambar_produk: gambar,
      link_pembelian: benefits || "#", 
      bahan_kandungan: ingredients || "", 
      ph_level: gabungKecocokan, // PERBAIKAN: Jangan bungkus parseFloat jika datanya string gabungan koma!
    });

    return res.status(201).json({
      status: "success",
      message: "Produk berhasil ditambahkan!",
      data: produkBaru,
    });
  } catch (error) {
    console.error("Gagal menambah produk:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 4. ADMIN: EDIT PRODUK (PUT) - FIXED ---
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
      kategori: category || produk.kategori, // PERBAIKAN: p.kategori diganti menjadi produk.kategori agar tidak crash
      brand: brand || produk.brand,
      deskripsi_produk: description || produk.deskripsi_produk,
      suitable_skin_type: skinType || produk.suitable_skin_type,
      harga_asli: price ? parseInt(price) : produk.harga_asli,
      link_pembelian: benefits || produk.link_pembelian,
      bahan_kandungan: ingredients || produk.bahan_kandungan,
      ph_level: gabungKecocokan !== ",,," ? gabungKecocokan : produk.ph_level,
    };

    if (req.file) {
      dataUpdate.gambar_produk = req.file.filename;
    } else if (req.files && Object.keys(req.files).length > 0) {
      const img1 = req.files?.["gambar_produk"]?.[0]?.filename || req.files?.["image1"]?.[0]?.filename;
      if (img1) dataUpdate.gambar_produk = img1;
    }

    await produk.update(dataUpdate);
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