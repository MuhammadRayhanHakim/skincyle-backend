const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Ambil token dari header 'Authorization'
  // Format biasanya: "Bearer <TOKEN>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Jika token tidak ada
  if (!token) {
    return res.status(401).json({ 
      status: "error", 
      message: "Akses ditolak, token tidak ditemukan" 
    });
  }

  try {
    // 3. Verifikasi token menggunakan secret key dari .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia_skincycle_2026");
    
    // 4. Simpan data user yang login ke dalam object 'req' agar bisa dipakai di controller
    req.user = decoded;
    
    // 5. Lanjut ke proses berikutnya (Controller)
    next();
  } catch (error) {
    return res.status(403).json({ 
      status: "error", 
      message: "Token tidak valid atau sudah kedaluwarsa" 
    });
  }
};

module.exports = authMiddleware;