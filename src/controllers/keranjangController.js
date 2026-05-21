// src/controllers/keranjangController.js
const { Keranjang, Produk } = require("../models");

// 1. AMBIL SEMUA ITEM DI KERANJANG BERDASARKAN USER ID
exports.getCartItems = async (req, res) => {
  try {
    // id_pengguna diambil dari token autentikasi (req.user.id atau sejenisnya)
    // Jika belum setup token user, sementara pakai id dummy (misal: 1) untuk testing
    const id_pengguna = req.user?.id || 1;

    const items = await Keranjang.findAll({
      where: { id_pengguna },
      include: [{ model: Produk }], // Ikut sertakan detail produk (nama, harga, gambar)
    });

    return res.json({ status: "success", data: items });
  } catch (error) {
    console.error("Error getCartItems:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. TAMBAH ATAU UPDATE PRODUK DI DALAM KERANJANG
exports.addToCart = async (req, res) => {
  try {
    const { id_produk, quantity } = req.body;
    const id_pengguna = req.user?.id || 1; // Fallback ke id 1 jika testing tanpa login

    // Cek apakah produk tersebut sudah ada di keranjang user
    const existingItem = await Keranjang.findOne({
      where: { id_pengguna, id_produk },
    });

    if (existingItem) {
      // Jika sudah ada, tambahkan quantity-nya
      existingItem.quantity += quantity ? parseInt(quantity) : 1;
      await existingItem.save();
      return res.json({
        status: "success",
        message: "Kuantitas produk di update!",
        data: existingItem,
      });
    } else {
      // Jika belum ada, buat record baru
      const newItem = await Keranjang.create({
        id_pengguna,
        id_produk,
        quantity: quantity || 1,
      });
      return res.status(201).json({
        status: "success",
        message: "Produk masuk ke keranjang database!",
        data: newItem,
      });
    }
  } catch (error) {
    console.error("Error addToCart:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 3. UPDATE QUANTITY LANGSUNG DARI TOMBOL + / - DI FRONTEND
exports.updateCartQty = async (req, res) => {
  try {
    const { id } = req.params; // ID Keranjang
    const { quantity } = req.body;

    await Keranjang.update(
      { quantity: parseInt(quantity) },
      { where: { id_keranjang: id } },
    );
    return res.json({
      status: "success",
      message: "Jumlah berhasil diperbarui!",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 4. HAPUS ITEM DARI KERANJANG (TOMBOL TRASH)
exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params; // ID Keranjang
    await Keranjang.destroy({ where: { id_keranjang: id } });
    return res.json({
      status: "success",
      message: "Item berhasil dihapus dari keranjang!",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
