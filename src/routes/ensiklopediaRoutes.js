const express = require("express");
const router = express.Router();
const ensiklopediaController = require("../controllers/ensiklopediaController");

router.get("/", ensiklopediaController.getAllArtikel);

module.exports = router;