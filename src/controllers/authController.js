const { Akun, Profil, Recycle } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Sequelize } = require("sequelize");

// 🎯 REUSABLE HELPER: Logika Perhitungan 4 Level Dinamis Berdasarkan Berat Asli Admin & Status Selesai
const dapatkanMetrikSirkular = async (id_profil) => {
  const beratResult = await Recycle.findOne({
    attributes: [
      // 🚀 SINKRONISASI MUTLAK: Menghitung total dari kolom 'berat_asli' yang valid dimasukkan oleh Admin
      [Sequelize.fn("SUM", Sequelize.col("berat_asli")), "total_berat"],
    ],
    where: {
      id_profil: id_profil,
      status_jemput: "selesai", // 🔥 KUNCI UTAMA: Sampah pending / belum disetujui tidak akan pernah terhitung
    },
    raw: true,
  });

  // Ambil angka berat murni hasil kalkulasi database (Default 0 jika null)
  const totalBerat = Math.round(parseFloat(beratResult?.total_berat || 0));

  // ── 🌟 LOGIKA 4 LEVEL BAHASA INDONESIA (TUNAS -> REKREASI TIER LEVEL 1-4) ──
  let levelPengguna = "Tunas";
  let teksLevelAngka = "Lv. 1";
  let targetBerikutnya = 30;
  let beratMinimalLevelLama = 0;

  if (totalBerat >= 90) {
    levelPengguna = "Penjaga";
    teksLevelAngka = "Lv. 4 (Max)";
    targetBerikutnya = 90;
    beratMinimalLevelLama = 90;
  } else if (totalBerat >= 60) {
    levelPengguna = "Eco";
    teksLevelAngka = "Lv. 3";
    targetBerikutnya = 90; // Menuju Penjaga
    beratMinimalLevelLama = 60;
  } else if (totalBerat >= 30) {
    levelPengguna = "Pahlawan Hijau";
    teksLevelAngka = "Lv. 2";
    targetBerikutnya = 60; // Menuju Eco
    beratMinimalLevelLama = 30;
  } else {
    levelPengguna = "Tunas";
    teksLevelAngka = "Lv. 1";
    targetBerikutnya = 30; // Menuju Pahlawan Hijau memerlukan 30kg
    beratMinimalLevelLama = 0;
  }

  // Hitung persentase progress bar di dalam rumpun levelnya secara akurat
  const selisihBobot = targetBerikutnya - beratMinimalLevelLama;
  const progressMurni = totalBerat - beratMinimalLevelLama;

  // Pengaman jika total berat masih 0 agar tidak memicu eror Division by Zero (NaN)
  const persentaseProgress =
    totalBerat > 0 && selisihBobot > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((progressMurni / selisihBobot) * 100)),
        )
      : 0;

  // Ambil saldo paling segar dari tabel Profil untuk disinkronkan ke Forum
  const profilUser = await Profil.findByPk(id_profil, {
    attributes: ["total_saldo"],
  });
  const saldoAktual = profilUser ? profilUser.total_saldo : 0;

  return {
    total_berat_kontribusi: totalBerat,
    persentase_progress: persentaseProgress,
    level_pengguna: levelPengguna,
    teks_level_angka: teksLevelAngka,
    target_berikutnya: targetBerikutnya,
    total_saldo: saldoAktual,
  };
};

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
      bio: "",
      foto_profil: null,
      total_saldo: 0,
      level_pengguna: "Tunas", // Default awal mendaftar adalah Tunas
      role: "user",
    });

    res
      .status(201)
      .json({ status: "success", message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// --- LOGIN DENGAN SINKRONISASI LEVEL & SALDO UTUH ---
exports.login = async (req, res) => {
  try {
    const { email, kata_sandi } = req.body;

    const user = await Akun.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Email belum terdaftar. Silakan daftar terlebih dahulu!",
      });
    }

    const isMatch = await bcrypt.compare(kata_sandi, user.kata_sandi);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Email atau kata sandi salah.",
      });
    }

    const profil = await Profil.findOne({ where: { id_akun: user.id_akun } });

    // 🚀 HITUNG METRIK DAN UPDATE DATABASE PROFILE AGAR SINKRON SEBELUM TOKEN TERBIT
    let metrikSirkular = {
      total_berat_kontribusi: 0,
      persentase_progress: 0,
      level_pengguna: "Tunas",
      teks_level_angka: "Lv. 1",
      target_berikutnya: 30,
      total_saldo: 0,
    };
    if (profil) {
      metrikSirkular = await dapatkanMetrikSirkular(profil.id_profil);

      // Simpan perubahan level dinamis ke row profil user secara permanen
      await profil.update({ level_pengguna: metrikSirkular.level_pengguna });
    }

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

    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        id_profil: profil?.id_profil,
        username: profil?.username,
        email: user.email,
        bio: profil?.bio || "",
        foto_profil: profil?.foto_profil || null,
        role: profil?.role || "user",
        total_saldo: metrikSirkular.total_saldo, // Menggunakan saldo aktual terhitung riil dari database profil
        total_berat_kontribusi: metrikSirkular.total_berat_kontribusi,
        persentase_progress: metrikSirkular.persentase_progress,
        level_pengguna: metrikSirkular.level_pengguna,
        teks_level_angka: metrikSirkular.teks_level_angka,
        target_berikutnya: metrikSirkular.target_berikutnya,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- GOOGLE LOGIN DENGAN SINKRONISASI LEVEL & SALDO UTUH ---
exports.googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        status: "error",
        message: "Access token Google tidak ditemukan.",
      });
    }

    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
    );

    const { email, name, picture } = googleResponse.data;

    let akun = await Akun.findOne({ where: { email } });
    let profil;

    if (!akun) {
      const salt = await bcrypt.genSalt(10);
      const fakePassword = await bcrypt.hash(Math.random().toString(36), salt);

      akun = await Akun.create({
        email: email,
        kata_sandi: fakePassword,
      });

      const cleanUsername = name
        ? name.replace(/\s+/g, "").toLowerCase()
        : "user_" + Date.now();

      profil = await Profil.create({
        id_akun: akun.id_akun,
        username: cleanUsername,
        bio: "Masuk menggunakan Akun Google ✨",
        foto_profil: picture || null,
        total_saldo: 0,
        level_pengguna: "Tunas",
        role: "user",
      });
    } else {
      profil = await Profil.findOne({ where: { id_akun: akun.id_akun } });
    }

    // 🚀 HITUNG METRIK UNTUK USER GOOGLE AUTH
    let metrikSirkular = {
      total_berat_kontribusi: 0,
      persentase_progress: 0,
      level_pengguna: "Tunas",
      teks_level_angka: "Lv. 1",
      target_berikutnya: 30,
      total_saldo: 0,
    };
    if (profil) {
      metrikSirkular = await dapatkanMetrikSirkular(profil.id_profil);
      await profil.update({ level_pengguna: metrikSirkular.level_pengguna });
    }

    const token = jwt.sign(
      {
        id_akun: akun.id_akun,
        id_profil: profil?.id_profil,
        username: profil?.username,
        role: profil?.role || "user",
      },
      process.env.JWT_SECRET || "rahasia_skincycle_2026",
      { expiresIn: "1d" },
    );

    return res.json({
      status: "success",
      message: "Login Google berhasil",
      data: {
        id_profil: profil?.id_profil,
        username: profil?.username,
        email: akun.email,
        bio: profil?.bio || "",
        foto_profil: profil?.foto_profil || null,
        role: profil?.role || "user",
        total_saldo: metrikSirkular.total_saldo, // Menggunakan saldo aktual terhitung riil dari database profil
        total_berat_kontribusi: metrikSirkular.total_berat_kontribusi,
        persentase_progress: metrikSirkular.persentase_progress,
        level_pengguna: metrikSirkular.level_pengguna,
        teks_level_angka: metrikSirkular.teks_level_angka,
        target_berikutnya: metrikSirkular.target_berikutnya,
        token: token,
      },
    });
  } catch (error) {
    console.error("Google OAuth Backend Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal memproses autentikasi Google Server.",
      error: error.message,
    });
  }
};

module.exports = {
  dapatkanMetrikSirkular,
  register: exports.register,
  login: exports.login,
  googleLogin: exports.googleLogin,
};
