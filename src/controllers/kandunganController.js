const { Kandungan } = require("../models");
const { Op } = require("sequelize"); // Import Operator Sequelize untuk pencarian

exports.getKandungan = async (req, res) => {
  try {
    const { q } = req.query; // Menangkap kata kunci dari URL, misal: ?q=niacinamide
    
    let queryOptions = {};
    if (q) {
      queryOptions = {
        where: {
          nama_kandungan: {
            [Op.iLike]: `%${q}%` // Mencari kata yang mirip (Case-insensitive)
          }
        }
      };
    }

    const data = await Kandungan.findAll(queryOptions);
    res.json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};