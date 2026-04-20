const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const authMiddleware = require("../middleware/authMiddleware");

// --- SEMUA RUTE DI BAWAH INI WAJIB LOGIN ---

// 1. Melihat semua postingan (Sekarang wajib login)
router.get("/", authMiddleware, forumController.getPosts);

// 2. Melihat detail postingan (Sekarang wajib login)
router.get("/:id_posting", authMiddleware, forumController.getPostDetail);

// 3. Membuat postingan baru
router.post("/create", authMiddleware, forumController.createPost);

// 4. Menambahkan komentar
router.post("/:id_posting/comment", authMiddleware, forumController.addComment);

// 5. Menghapus postingan
router.delete("/:id_posting", authMiddleware, forumController.deletePost);

module.exports = router;
