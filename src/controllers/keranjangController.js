const Keranjang = require("../models/Keranjang");
const Produk = require("../models/Produk");

// 1. AMBIL SEMUA ITEM DI KERANJANG BERDASARKAN USER ID
exports.getCartItems = async (req, res) => {
  try {
    const id_pengguna = req.user?.id_profil || req.user?.id || 1;

    const items = await Keranjang.findAll({
      where: { id_pengguna },
      include: [{ model: Produk }],
    });
    return res.json({ status: "success", data: items });
  } catch (error) {
    console.error("Error getCartItems:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// 2. TAMBAH ATAU UPDATE PRODUK DI DALAM KERANJANG (PERBAIKAN ERROR INDEKS)
exports.addToCart = async (req, res) => {
  try {
    const { id_produk, quantity } = req.body;
    // Menggunakan id_profil yang konsisten disuntikkan oleh authMiddleware Anda
    const id_pengguna = req.user?.id_profil || req.user?.id || 1;

    // Sekarang Keranjang dipastikan terbaca dan tidak undefined
    const existingItem = await Keranjang.findOne({
      where: { id_pengguna, id_produk },
    });

    if (existingItem) {
      existingItem.quantity += quantity ? parseInt(quantity) : 1;
      await existingItem.save();
      return res.json({
        status: "success",
        message: "Kuantitas produk di update!",
        data: existingItem,
      });
    } else {
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
    const { id } = req.params;
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
    const { id } = req.params;
    await Keranjang.destroy({ where: { id_keranjang: id } });
    return res.json({
      status: "success",
      message: "Item berhasil dihapus dari keranjang!",
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
