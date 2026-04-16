const { Akun, Profil } = require("../models");

// Fungsi untuk pendaftaran user baru
exports.register = async (req, res) => {
  try {
    const { email, kata_sandi, username } = req.body;

    // 1. Simpan ke tabel akun_pengguna dulu
    const akunBaru = await Akun.create({
      email,
      kata_sandi,
    });

    // 2. Simpan ke tabel profil_pengguna menggunakan ID dari akunBaru
    await Profil.create({
      id_akun: akunBaru.id_akun,
      username: username,
    });

    res.status(201).json({
      status: "success",
      message: "ok",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Nanti Anda bisa menambahkan exports.login di bawah sini
exports.login = async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    // 1. Cari akun berdasarkan email
    const user = await Akun.findOne({ where: { email } });

    // 2. Jika user tidak ditemukan atau sandi salah
    if (!user || user.kata_sandi !== kata_sandi) {
      return res.status(401).json({
        status: "error",
        message: "Email atau kata sandi salah",
      });
    }

    // 3. Ambil profil untuk mendapatkan id_profil
    const profil = await Profil.findOne({ where: { id_akun: user.id_akun } });

    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        id_akun: user.id_akun,
        id_profil: profil ? profil.id_profil : null,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
