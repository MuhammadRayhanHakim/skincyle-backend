const { Akun, Profil } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { email, kata_sandi, username } = req.body;

    const emailExist = await Akun.findOne({ where: { email } });
    if (emailExist) {
      return res
        .status(400)
        .json({ status: "error", message: "Email sudah terdaftar" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedSandi = await bcrypt.hash(kata_sandi, salt);

    const akunBaru = await Akun.create({
      email,
      kata_sandi: hashedSandi,
    });

    // Inisialisasi Profil dengan Saldo 0
    await Profil.create({
      id_akun: akunBaru.id_akun,
      username: username,
      total_saldo: 0,
      level_pengguna: "Newbie",
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;
    const user = await Akun.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(kata_sandi, user.kata_sandi))) {
      return res.status(401).json({
        status: "error",
        message: "Email atau kata sandi salah",
      });
    }

    const profil = await Profil.findOne({ where: { id_akun: user.id_akun } });

    const token = jwt.sign(
      {
        id_akun: user.id_akun,
        id_profil: profil ? profil.id_profil : null,
        username: profil ? profil.username : null,
      },
      process.env.JWT_SECRET || "rahasia_skincycle_2026",
      { expiresIn: "1d" },
    );

    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        id_profil: profil ? profil.id_profil : null,
        username: profil ? profil.username : null,
        total_saldo: profil ? profil.total_saldo : 0,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
