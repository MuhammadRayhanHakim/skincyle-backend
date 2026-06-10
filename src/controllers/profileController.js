// const Profil = require("../models/Profil"); // Pastikan path model sesuai

// exports.getProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const profil = await Profil.findByPk(id);
//     if (!profil) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });
//     }
//     res.json({ status: "success", data: profil });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// // 🆕 FUNGSI PUT: MENYIMPAN PERUBAHAN PROFIL & AVATAR BARU
// exports.updateProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, bio } = req.body;

//     const profil = await Profil.findByPk(id);
//     if (!profil) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "Profil tidak ditemukan" });
//     }

//     // Susun objek data yang ingin di-update
//     const updatedData = {
//       username: username || profil.username,
//       bio: bio !== undefined ? bio : profil.bio,
//     };

//     // Jika admin/user mengunggah berkas foto baru lewat Multer
//     if (req.file) {
//       updatedData.foto_profil = req.file.filename;
//     }

//     // Eksekusi pembaruan ke database PostgreSQL
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

// exports.deletePhotoProfile = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Cari data berdasarkan Primary Key id_profil
//     const profil = await Profil.findByPk(id);
//     if (!profil) {
//       return res.status(404).json({
//         status: "error",
//         message: "Profil gagal ditemukan di sistem database.",
//       });
//     }

//     // Ubah nilai kolom foto_profil kembali menjadi null (kosong) di database PostgreSQL
//     await profil.update({ foto_profil: null });

//     res.json({
//       status: "success",
//       message: "Foto profil berhasil dihapus dari database!",
//       data: profil,
//     });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

const { Profil } = require("../models"); // Pastikan path model terpusat sesuai setup project

// ─── 1. AMBIL DATA PROFIL USER AKTIF ───
exports.getProfile = async (req, res) => {
  try {
    // Ambil ID secara aman dari token login user yang terverifikasi
    const id_user = req.user.id_profil;

    const profil = await Profil.findByPk(id_user);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }
    res.json({ status: "success", data: profil });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ─── 2. SIMPAN PERUBAHAN INFORMASI TEKS PROFIL ───
exports.updateProfile = async (req, res) => {
  try {
    const id_user = req.user.id_profil;

    // Tangkap seluruh field data yang dikirim oleh form EditProfilePage frontend
    const { username, email, nomor_telepon, alamat_rumah, suitable_skin_type } =
      req.body;

    const profil = await Profil.findByPk(id_user);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    // Susun objek data dengan fallback nilai lama jika field tidak diisi
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

    // Eksekusi pembaruan ke database PostgreSQL
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

// ─── 3. UNGGAH / GANTI FOTO PROFIL BARU VIA MULTER ───
exports.uploadPhotoProfile = async (req, res) => {
  try {
    const id_user = req.user.id_profil;

    const profil = await Profil.findByPk(id_user);
    if (!profil) {
      return res
        .status(404)
        .json({ status: "error", message: "Profil tidak ditemukan" });
    }

    // Validasi apakah ada file gambar yang diunggah dari Multer
    if (!req.file) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Mohon pilih file gambar terlebih dahulu.",
        });
    }

    // Update nama file gambar baru ke kolom database foto_profil
    await profil.update({ foto_profil: req.file.filename });

    res.json({
      status: "success",
      message: "Foto profil baru berhasil diunggah!",
      foto_profil: req.file.filename, // Dikembalikan ke frontend untuk memperbarui state user global
      data: profil,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ─── 4. HAPUS FOTO PROFIL (KEMBALI KE AVATAR DEFAULT) ───
exports.deletePhotoProfile = async (req, res) => {
  try {
    const id_user = req.user.id_profil;

    const profil = await Profil.findByPk(id_user);
    if (!profil) {
      return res.status(404).json({
        status: "error",
        message: "Profil gagal ditemukan di sistem database.",
      });
    }

    // Ubah nilai kolom foto_profil kembali menjadi null (kosong) di database PostgreSQL
    await profil.update({ foto_profil: null });

    res.json({
      status: "success",
      message: "Foto profil berhasil dihapus dari database!",
      data: profil,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
