const midtransClient = require("midtrans-client");

// Inisialisasi Snap API Client secara terpusat
const snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true jika sudah Production rilis
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

module.exports = snap;
