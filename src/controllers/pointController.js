const { RiwayatPoin } = require("../models");

exports.getPointHistory = async (req, res) => {
  try {
    const id_profil = req.user.id_profil;

    const history = await RiwayatPoin.findAll({
      where: { id_profil },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: "success",
      data: history
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};