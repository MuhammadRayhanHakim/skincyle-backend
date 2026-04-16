const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");

// Pastikan method-nya POST dan path-nya "/create"
router.post("/create", forumController.createPost);
router.get("/", forumController.getPosts);
module.exports = router; // <--- CEK INI, JANGAN SAMPAI TYPO
