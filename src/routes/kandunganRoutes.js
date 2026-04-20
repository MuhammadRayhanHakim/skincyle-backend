const express = require("express");
const router = express.Router();
const kandunganController = require("../controllers/kandunganController");

router.get("/", kandunganController.getKandungan);

module.exports = router;