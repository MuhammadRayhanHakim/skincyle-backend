const { Profil } = require("../models");

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profil = await Profil.findByPk(id);
    if (!profil) {
      return res.status(404).json({ status: "error", message: "Profil tidak ditemukan" });
    }
    res.json({ status: "success", data: profil });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};