const { Akun, Profil } = require("../models");
const jwt = require("jsonwebtoken"); // Tambahkan ini
// const bcrypt = require("bcryptjs"); // Gunakan ini jika ingin enkripsi password

// 1. Fungsi Register
exports.register = async (req, res) => {
  try {
    const { email, kata_sandi, username } = req.body;

    // Opsional: Hashing password sebelum simpan
    // const salt = await bcrypt.genSalt(10);
    // const hashedSandi = await bcrypt.hash(kata_sandi, salt);

    const akunBaru = await Akun.create({
      email,
      kata_sandi, // Ganti jadi hashedSandi jika pakai bcrypt
    });

    await Profil.create({
      id_akun: akunBaru.id_akun,
      username: username,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// 2. Fungsi Login (DENGAN JWT)
exports.login = async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    // 1. Cari akun berdasarkan email
    const user = await Akun.findOne({ where: { email } });

    // 2. Jika user tidak ditemukan
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Email tidak terdaftar",
      });
    }

    // 3. Cek Password (saat ini masih teks biasa sesuai database Anda)
    if (user.kata_sandi !== kata_sandi) {
      return res.status(401).json({
        status: "error",
        message: "Kata sandi salah",
      });
    }

    // 4. Ambil profil untuk mendapatkan data user
    const profil = await Profil.findOne({ where: { id_akun: user.id_akun } });

    // 5. GENERATE TOKEN JWT
    // Data ini yang akan terbaca di 'req.user' pada Middleware
    const token = jwt.sign(
      { 
        id_akun: user.id_akun, 
        id_profil: profil ? profil.id_profil : null,
        username: profil ? profil.username : null 
      },
      process.env.JWT_SECRET || "rahasia_skincycle_2026", // Secret Key
      { expiresIn: "1d" } // Token berlaku 24 jam
    );

    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        id_profil: profil ? profil.id_profil : null,
        username: profil ? profil.username : null,
        token: token, // TOKEN INI YANG DISIMPAN FRONTEND/POSTMAN
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};