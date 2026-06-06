// const { Produk, Kandungan, keranjang } = require("../models");
// const { Op } = require("sequelize");

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

// // --- 2. USER: AMBIL DETAIL PRODUK + ANALISIS KOMPOSISI BAHAN DINAMIS (GET) ---
// exports.getProdukById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const produkData = await Produk.findByPk(id);

//     if (!produkData) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Produk tidak ditemukan." });
//     }

//     // Ubah data instance ke plain object agar bisa dimodifikasi kustom
//     const produk = produkData.toJSON();

//     // Ambil string bahan_kandungan dari form admin (misal: "Vitamin D, Vitamin C, Vitamin A")
//     const stringBahan = produk.bahan_kandungan || "";

//     // Pecah menjadi array dan bersihkan spasi di awal/akhir kata
//     const arrayBahan = stringBahan
//       .split(",")
//       .map((b) => b.trim())
//       .filter(Boolean);

//     let daftarKomposisiDinamis = [];

//     if (arrayBahan.length > 0) {
//       // Cari data deskripsi fungsi bahan langsung ke tabel kandungan database Anda
//       const dataKandunganTerdaftar = await Kandungan.findAll({
//         where: {
//           nama_kandungan: {
//             [Op.in]: arrayBahan,
//           },
//         },
//       });

//       // Petakan hasilnya agar frontend menerima deskripsi dinamis dari admin
//       daftarKomposisiDinamis = arrayBahan.map((namaBahan) => {
//         // Cocokkan apakah bahan tersebut sudah diinput deskripsinya di tabel kandungan
//         const cocok = dataKandunganTerdaftar.find(
//           (k) => k.nama_kandungan.toLowerCase() === namaBahan.toLowerCase(),
//         );

//         return {
//           nama: namaBahan,
//           safe: cocok ? cocok.status_publikasi || "SAFE" : "SAFE",
//           // Jika admin sudah mengisi di menu Bahan Skincare, tampilkan fungsinya. Jika belum, tampilkan fallback teks default.
//           deskripsi: cocok
//             ? cocok.fungsi || cocok.deskripsi_fungsi || cocok.manfaat
//             : "Bahan aktif pilihan laboratorium kurasi SkinCycle untuk mengoptimalkan kesehatan jaringan sel kulit harian.",
//         };
//       });
//     }

//     // Masukkan array hasil join kandungan ke dalam properti baru objek response
//     produk.komposisi_analisis = daftarKomposisiDinamis;

//     return res.json({ status: "success", data: produk });
//   } catch (error) {
//     console.error("Error getProdukById Dinamis:", error);
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
//       skinOily,
//       skinDry,
//       skinKombinasi,
//       skinSensitif,
//       linkBeli,
//     } = req.body;

//     let gambar = "default.jpg";
//     if (req.file) {
//       gambar = req.file.filename;
//     } else if (req.files?.["gambar_produk"]) {
//       gambar = req.files["gambar_produk"][0].filename;
//     } else if (req.files?.["image1"]) {
//       gambar = req.files["image1"][0].filename;
//     }

//     const gabungKecocokan = [
//       skinOily || 0,
//       skinDry || 0,
//       skinKombinasi || 0,
//       skinSensitif || 0,
//     ].join(",");

//     const produkBaru = await Produk.create({
//       nama_produk: name,
//       kategori: category || "Semua",
//       brand: brand || "SkinCycle",
//       deskripsi_produk: description || "",
//       suitable_skin_type: skinType || "Semua",
//       harga_asli: price ? parseInt(price) : 0,
//       gambar_produk: gambar,
//       link_pembelian: linkBeli || "#",
//       bahan_kandungan: ingredients || "",
//       ph_level: gabungKecocokan,
//       manfaat_utama: benefits || "",
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
//       skinOily,
//       skinDry,
//       skinKombinasi,
//       skinSensitif,
//       linkBeli,
//     } = req.body;

//     const produk = await Produk.findByPk(id);
//     if (!produk) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Produk tidak ditemukan." });
//     }

//     const gabungKecocokan = [
//       skinOily || 0,
//       skinDry || 0,
//       skinKombinasi || 0,
//       skinSensitif || 0,
//     ].join(",");

//     const dataUpdate = {
//       nama_produk: name || produk.nama_produk,
//       kategori: category || produk.kategori,
//       brand: brand || produk.brand,
//       deskripsi_produk: description || produk.deskripsi_produk,
//       suitable_skin_type: skinType || produk.suitable_skin_type,
//       harga_asli: price ? parseInt(price) : produk.harga_asli,
//       link_pembelian: linkBeli || produk.link_pembelian,
//       bahan_kandungan: ingredients || produk.bahan_kandungan,
//       ph_level:
//         gabungKecocokan !== "0,0,0,0" ? gabungKecocokan : produk.ph_level,
//       manfaat_utama: benefits || produk.manfaat_utama,
//     };

//     if (req.file) {
//       dataUpdate.gambar_produk = req.file.filename;
//     } else if (req.files && Object.keys(req.files).length > 0) {
//       const img1 =
//         req.files?.["gambar_produk"]?.[0]?.filename ||
//         req.files?.["image1"]?.[0]?.filename;
//       if (img1) dataUpdate.gambar_produk = img1;
//     }

//     await produk.update(dataUpdate);
//     return res.json({ status: "success", message: "Produk diperbarui!" });
//   } catch (error) {
//     console.error("Gagal memperbarui produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // --- 5. ADMIN: HAPUS PRODUK (DELETE) ---
// exports.deleteProduk = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (keranjang) {
//       await keranjang.destroy({ where: { id_produk: id } });
//     }

//     await Produk.destroy({ where: { id_produk: id } });
//     return res.json({ status: "success", message: "Produk berhasil dihapus" });
//   } catch (error) {
//     console.error("Gagal menghapus produk:", error);
//     return res.status(500).json({ status: "error", message: error.message });
//   }
// };

const { Produk, Kandungan, keranjang } = require("../models");
const { Op } = require("sequelize");

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

// --- 2. USER: AMBIL DETAIL PRODUK + ANALISIS KOMPOSISI BAHAN DINAMIS (GET) ---
exports.getProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const produkData = await Produk.findByPk(id);

    if (!produkData) {
      return res
        .status(404)
        .json({ status: "error", message: "Produk tidak ditemukan." });
    }

    const produk = produkData.toJSON();
    const stringBahan = produk.bahan_kandungan || "";
    const arrayBahan = stringBahan
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    let daftarKomposisiDinamis = [];

    if (arrayBahan.length > 0) {
      const dataKandunganTerdaftar = await Kandungan.findAll({
        where: {
          nama_kandungan: {
            [Op.in]: arrayBahan,
          },
        },
      });

      daftarKomposisiDinamis = arrayBahan.map((namaBahan) => {
        const cocok = dataKandunganTerdaftar.find(
          (k) => k.nama_kandungan.toLowerCase() === namaBahan.toLowerCase(),
        );

        return {
          nama: namaBahan,
          safe: cocok ? cocok.status_publikasi || "SAFE" : "SAFE",
          deskripsi: cocok
            ? cocok.fungsi || cocok.deskripsi_fungsi || cocok.manfaat
            : "Bahan aktif pilihan laboratorium kurasi SkinCycle untuk mengoptimalkan kesehatan jaringan sel kulit harian.",
        };
      });
    }

    produk.komposisi_analisis = daftarKomposisiDinamis;
    return res.json({ status: "success", data: produk });
  } catch (error) {
    console.error("Error getProdukById Dinamis:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 3. ADMIN: TAMBAH PRODUK BARU (POST - TANPA LINK BELI) ---
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

    let stringGambar = "default.jpg";
    if (req.files && req.files.length > 0) {
      const namaFiles = req.files.map((file) => file.filename);
      stringGambar = namaFiles.join(",");
    }

    const gabungKecocokan = [
      skinOily || 0,
      skinDry || 0,
      skinKombinasi || 0,
      skinSensitif || 0,
    ].join(",");

    const produkBaru = await Produk.create({
      nama_produk: name,
      kategori: category || "Semua",
      brand: brand || "SkinCycle",
      deskripsi_produk: description || "",
      suitable_skin_type: skinType || "Semua",
      harga_asli: price ? parseInt(price) : 0,
      gambar_produk: stringGambar,
      bahan_kandungan: ingredients || "",
      ph_level: gabungKecocokan,
      manfaat_utama: benefits || "",
    });

    return res.status(201).json({
      status: "success",
      message: "Produk berhasil ditambahkan dengan multi-gambar!",
      data: produkBaru,
    });
  } catch (error) {
    console.error("Gagal menambah produk:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// --- 4. ADMIN: EDIT PRODUK (PUT - TANPA LINK BELI) ---
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
      skinOily || 0,
      skinDry || 0,
      skinKombinasi || 0,
      skinSensitif || 0,
    ].join(",");

    const dataUpdate = {
      nama_produk: name || produk.nama_produk,
      kategori: category || produk.kategori,
      brand: brand || produk.brand,
      deskripsi_produk: description || produk.deskripsi_produk,
      suitable_skin_type: skinType || produk.suitable_skin_type,
      harga_asli: price ? parseInt(price) : produk.harga_asli,
      bahan_kandungan: ingredients || produk.bahan_kandungan,
      ph_level:
        gabungKecocokan !== "0,0,0,0" ? gabungKecocokan : produk.ph_level,
      manfaat_utama: benefits || produk.manfaat_utama,
    };

    if (req.files && req.files.length > 0) {
      const namaFiles = req.files.map((file) => file.filename);
      dataUpdate.gambar_produk = namaFiles.join(",");
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

    if (keranjang) {
      await keranjang.destroy({ where: { id_produk: id } });
    }

    await Produk.destroy({ where: { id_produk: id } });
    return res.json({ status: "success", message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
