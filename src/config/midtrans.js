const midtransClient = require("midtrans-client");

// Inisialisasi Snap API Client secara terpusat
const snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true jika sudah Production rilis
  serverKey:
    process.env.MIDTRANS_SERVER_KEY || "Mid-server-q5haZkC8ubhsRXAaXYaVyDwz",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "Mid-client-yeSrRc9OZS_0BHTE",
});

module.exports = snap;
