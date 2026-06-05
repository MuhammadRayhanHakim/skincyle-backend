const { Akun, Profil } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// --- REGISTER ---
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

    await Profil.create({
      id_akun: akunBaru.id_akun,
      username: username,
      bio: "", // Default bio kosong
      foto_profil: null, // Default foto profil belum ada
      total_saldo: 0,
      level_pengguna: "Newbie",
      role: "user",
    });

    res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// --- LOGIN DENGAN NOTIFIKASI SPESIFIK & SINKRONISASI AVATAR DATA ---
exports.login = async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    // 1. Cek apakah email terdaftar di database
    const user = await Akun.findOne({ where: { email } });

    // JIKA EMAIL TIDAK DITEMUKAN
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Email belum terdaftar. Silakan daftar terlebih dahulu!",
      });
    }

    // 2. Jika email ada, baru cek kecocokan kata sandi
    const isMatch = await bcrypt.compare(kata_sandi, user.kata_sandi);

    // JIKA KATA SANDI SALAH
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Email atau kata sandi salah.",
      });
    }

    // 3. Jika semua benar, ambil profil utuh (termasuk foto_profil dan bio dari database)
    const profil = await Profil.findOne({ where: { id_akun: user.id_akun } });

    // Masukkan data dinamis ke dalam Token JWT
    const token = jwt.sign(
      {
        id_akun: user.id_akun,
        id_profil: profil?.id_profil,
        username: profil?.username,
        role: profil?.role || "user",
      },
      process.env.JWT_SECRET || "rahasia_skincycle_2026",
      { expiresIn: "1d" },
    );

    // 🚀 RETURN DATA SEGAR: Sertakan foto_profil & bio terbaru hasil update user
    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        id_profil: profil?.id_profil,
        username: profil?.username,
        email: user.email,
        bio: profil?.bio || "",
        foto_profil: profil?.foto_profil || null, // 🆕 Kolom ini wajib ikut dikirim!
        role: profil?.role || "user",
        total_saldo: profil?.total_saldo || 0,
        level_pengguna: profil?.level_pengguna || "Newbie",
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
