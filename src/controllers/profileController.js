// const { Profil, Recycle } = require("../models");
// const { Sequelize, Op } = require("sequelize");

// // 🎯 LOCAL HELPER FIXED: Menggunakan Pendekatan Substring & Kebal Terhadap Sensitivitas Huruf (Case-Insensitive)
// const kalkulasiMetrikSirkularLokal = async (id_profil) => {
//   const beratResult = await Recycle.findOne({
//     attributes: [
//       [
//         // Menjamin konversi ke float murni aman, baik data berupa angka murni (4) maupun string teks (4 kg)
//         Sequelize.literal(`
//           COALESCE(
//             SUM(
//               CAST(
//                 NULLIF(
//                   SUBSTRING(CAST(berat_asli AS TEXT) FROM '[0-9.]+:*'),
//                   ''
//                 ) AS FLOAT
//               )
//             ),
//             0
//           )
//         `),
//         "total_berat",
//       ],
//     ],
//     where: {
//       id_profil: id_profil,
//       // 🚀 SOLUSI UTAMA: Mendukung status "selesai" (huruf kecil) maupun "SELESAI" (huruf besar sesuai pgAdmin Anda)
//       status_jemput: {
//         [Op.or]: ["selesai", "SELESAI"],
//       },
//     },
//     raw: true,
//   });

//   // Konversi hasil kueri ke data float murni
//   const totalBerat = parseFloat(beratResult?.total_berat) || 0;

//   // ── 🌟 LOGIKA BREAKDOWN TIER LEVEL SKINCYCLE ──
//   let levelPengguna = "Tunas";
//   let teksLevelAngka = "Lv. 1";
//   let targetBerikutnya = 30;
//   let beratMinimalLevelLama = 0;

//   if (totalBerat >= 90) {
//     levelPengguna = "Penjaga";
//     teksLevelAngka = "Lv. 4 (Max)";
//     targetBerikutnya = 90;
//     beratMinimalLevelLama = 90;
//   } else if (totalBerat >= 60) {
//     levelPengguna = "Eco";
//     teksLevelAngka = "Lv. 3";
//     targetBerikutnya = 90;
//     beratMinimalLevelLama = 60;
//   } else if (totalBerat >= 30) {
//     levelPengguna = "Pahlawan Hijau";
//     teksLevelAngka = "Lv. 2";
//     targetBerikutnya = 60;
//     beratMinimalLevelLama = 30;
//   } else {
//     levelPengguna = "Tunas";
//     teksLevelAngka = "Lv. 1";
//     targetBerikutnya = 30;
//     beratMinimalLevelLama = 0;
//   }

//   const selisihBobot = targetBerikutnya - beratMinimalLevelLama;
//   const progressMurni = totalBerat - beratMinimalLevelLama;

//   const persentaseProgress =
//     totalBerat > 0 && selisihBobot > 0
//       ? Math.min(
//           100,
//           Math.max(0, Math.round((progressMurni / selisihBobot) * 100)),
//         )
//       : 0;

//   return {
//     total_berat_kontribusi: totalBerat,
//     persentase_progress: persentaseProgress,
//     level_pengguna: levelPengguna,
//     teks_level_angka: teksLevelAngka,
//     target_berikutnya: targetBerikutnya,
//   };
// };

// // ─── 1. ENDPOINT: GET PROFILE DATA ───
// exports.getProfile = async (req, res) => {
//   try {
//     const id_user = req.user.id_profil;
//     const profil = await Profil.findByPk(id_user);

//     if (!profil) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });
//     }

//     const metrik = await kalkulasiMetrikSirkularLokal(id_user);

//     res.json({
//       status: "success",
//       data: {
//         ...profil.toJSON(),
//         total_berat_kontribusi: metrik.total_berat_kontribusi,
//         persentase_progress: metrik.persentase_progress,
//         level_pengguna: metrik.level_pengguna,
//         teks_level_angka: metrik.teks_level_angka,
//         target_berikutnya: metrik.target_berikutnya,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // ─── 2. ENDPOINT: GET PROFILE STATS ───
// exports.getProfileStats = async (req, res) => {
//   try {
//     const id_user = req.user.id_profil;
//     const profil = await Profil.findByPk(id_user);

//     if (!profil) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });
//     }

//     const metrik = await kalkulasiMetrikSirkularLokal(id_user);

//     res.json({
//       status: "success",
//       data: {
//         total_berat_recycle: metrik.total_berat_kontribusi,
//         total_thread: 0,
//         total_likes_received: 0,
//         riwayat_pembelian_count: 0,
//         jumlah_setoran: profil.jumlah_setoran || 0,
//         level_pengguna: metrik.level_pengguna,
//         persentase_progress: metrik.persentase_progress,
//         teks_level_angka: metrik.teks_level_angka,
//         target_berikutnya: metrik.target_berikutnya,
//         total_saldo: profil.total_saldo || 0,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // ─── 3. ENDPOINT: UPDATE TEXT PROFILE INFO ───
// exports.updateProfile = async (req, res) => {
//   try {
//     const id_user = req.user.id_profil;
//     const { username, email, nomor_telepon, alamat_rumah, suitable_skin_type } =
//       req.body;
//     const profil = await Profil.findByPk(id_user);
//     if (!profil) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });
//     }

//     const updatedData = {
//       username: username !== undefined ? username : profil.username,
//       email: email !== undefined ? email : profil.email,
//       nomor_telepon:
//         nomor_telepon !== undefined ? nomor_telepon : profil.nomor_telepon,
//       alamat_rumah:
//         alamat_rumah !== undefined ? alamat_rumah : profil.alamat_rumah,
//       suitable_skin_type:
//         suitable_skin_type !== undefined
//           ? suitable_skin_type
//           : profil.suitable_skin_type,
//     };

//     await profil.update(updatedData);
//     res.json({
//       status: "success",
//       message: "Profil berhasil diperbarui!",
//       data: profil,
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // ─── 4. ENDPOINT: UPLOAD AVATAR PHOTO ───
// exports.uploadPhotoProfile = async (req, res) => {
//   try {
//     const id_user = req.user.id_profil;
//     const profil = await Profil.findByPk(id_user);
//     if (!profil)
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });
//     if (!req.file)
//       return res
//         .status(400)
//         .json({ status: "error", message: "Mohon pilih file gambar." });

//     await profil.update({ foto_profil: req.file.filename });
//     res.json({
//       status: "success",
//       message: "Foto profil berhasil diunggah!",
//       foto_profil: req.file.filename,
//       data: profil,
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // ─── 5. ENDPOINT: DELETE AVATAR PHOTO ───
// exports.deletePhotoProfile = async (req, res) => {
//   try {
//     const id_user = req.user.id_profil;
//     const profil = await Profil.findByPk(id_user);
//     if (!profil)
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });

//     await profil.update({ foto_profil: null });
//     res.json({
//       status: "success",
//       message: "Foto profil berhasil dihapus!",
//       data: profil,
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };


























const { Profil, Recycle } = require("../models");
const { Sequelize, Op } = require("sequelize");

// 🎯 LOCAL HELPER FIXED: Menjumlahkan data murni numerik berat_asli lintas status (selesai/SELESAI)
const kalkulasiMetrikSirkularLokal = async (id_profil) => {
  const beratResult = await Recycle.findOne({
    attributes: [
      [
        // Karena adminController sudah menyimpan angka bersih, kueri dioptimalkan langsung menjumlahkan (SUM)
        Sequelize.literal(`COALESCE(SUM(berat_asli), 0)`),
        "total_berat",
      ],
    ],
    where: {
      id_profil: id_profil,
      status_jemput: {
        [Op.or]: ["selesai", "SELESAI"],
      },
    },
    raw: true,
  });

  const totalBerat = parseFloat(beratResult?.total_berat) || 0;

  // ── 🌟 LOGIKA BREAKDOWN TIER LEVEL SKINCYCLE ──
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
    targetBerikutnya = 90;
    beratMinimalLevelLama = 60;
  } else if (totalBerat >= 30) {
    levelPengguna = "Pahlawan Hijau";
    teksLevelAngka = "Lv. 2";
    targetBerikutnya = 60;
    beratMinimalLevelLama = 30;
  } else {
    levelPengguna = "Tunas";
    teksLevelAngka = "Lv. 1";
    targetBerikutnya = 30;
    beratMinimalLevelLama = 0;
  }

  const selisihBobot = targetBerikutnya - beratMinimalLevelLama;
  const progressMurni = totalBerat - beratMinimalLevelLama;

  const persentaseProgress =
    totalBerat > 0 && selisihBobot > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((progressMurni / selisihBobot) * 100)),
        )
      : 0;

  return {
    total_berat_kontribusi: totalBerat,
    persentase_progress: persentaseProgress,
    level_pengguna: levelPengguna,
    teks_level_angka: teksLevelAngka,
    target_berikutnya: targetBerikutnya,
  };
};

// ─── 1. ENDPOINT: GET PROFILE DATA ───
exports.getProfile = async (req, res) => {
  try {
    const id_user = req.user.id_profil;
    const profil = await Profil.findByPk(id_user);

    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    const metrik = await kalkulasiMetrikSirkularLokal(id_user);

    res.json({
      status: "success",
      data: {
        ...profil.toJSON(),
        total_berat_kontribusi: metrik.total_berat_kontribusi,
        persentase_progress: metrik.persentase_progress,
        level_pengguna: metrik.level_pengguna,
        teks_level_angka: metrik.teks_level_angka,
        target_berikutnya: metrik.target_berikutnya,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ─── 2. ENDPOINT: GET PROFILE STATS ───
exports.getProfileStats = async (req, res) => {
  try {
    const id_user = req.user.id_profil;
    const profil = await Profil.findByPk(id_user);

    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    const metrik = await kalkulasiMetrikSirkularLokal(id_user);

    res.json({
      status: "success",
      data: {
        total_berat_recycle: metrik.total_berat_kontribusi,
        total_thread: 0,
        total_likes_received: 0,
        riwayat_pembelian_count: 0,
        jumlah_setoran: profil.jumlah_setoran || 0,
        level_pengguna: metrik.level_pengguna,
        persentase_progress: metrik.persentase_progress,
        teks_level_angka: metrik.teks_level_angka,
        target_berikutnya: metrik.target_berikutnya,
        total_saldo: profil.total_saldo || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ─── 3. SIMPAN PERUBAHAN INFORMASI TEKS PROFIL ───
exports.updateProfile = async (req, res) => {
  try {
    // AMAN: Gunakan ID dari parameter URL jika ada, jika tidak ada fallback ke ID dari Token Jwt
    const id_user = req.params.id || req.user.id_profil;

    const { username, email, nomor_telepon, alamat_rumah, suitable_skin_type } =
      req.body;
    const profil = await Profil.findByPk(id_user);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    const updatedData = {
      username: username !== undefined ? username : profil.username,
      email: email !== undefined ? email : profil.email,
      nomor_telepon:
        nomor_telepon !== undefined ? nomor_telepon : profil.nomor_telepon,
      alamat_rumah:
        alamat_rumah !== undefined ? alamat_rumah : profil.alamat_rumah,
      suitable_skin_type:
        suitable_skin_type !== undefined
          ? suitable_skin_type
          : profil.suitable_skin_type,
    };

    await profil.update(updatedData);

    res.json({
      status: "success",
      message: "Profil berhasil diperbarui!",
      data: profil,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
// ─── 4. UNGGAH / GANTI FOTO PROFIL BARU ───
exports.uploadPhotoProfile = async (req, res) => {
  try {
    const id_user = req.params.id || req.user.id_profil;
    const profil = await Profil.findByPk(id_user);

    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    // Periksa apakah file gambar berhasil divalidasi oleh Multer
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "error", message: "Mohon pilih file gambar." });
    }

    // 1. Update nama file foto profil baru hasil simpan Multer ke database
    await profil.update({ foto_profil: req.file.filename });

    // 2. Ambil data profil terbaru yang sudah ter-update secara segar dari database
    const profilTerbaru = await Profil.findByPk(id_user);

    // 3. Kirim objek profil JSON utuh agar cocok dengan kebutuhan state di frontend
    res.json({
      status: "success",
      message: "Foto profil berhasil diunggah!",
      data: profilTerbaru.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ─── 5. HAPUS FOTO PROFIL ───
exports.deletePhotoProfile = async (req, res) => {
  try {
    const id_user = req.params.id || req.user.id_profil;
    const profil = await Profil.findByPk(id_user);

    if (!profil)
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });

    await profil.update({ foto_profil: null });

    res.json({
      status: "success",
      message: "Foto profil berhasil dihapus!",
      data: profil,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
