const { Ensiklopedia } = require("../models");

exports.getAllArtikel = async (req, res) => {
  try {
    const artikel = await Ensiklopedia.findAll();
    res.json({ status: "success", data: artikel });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};