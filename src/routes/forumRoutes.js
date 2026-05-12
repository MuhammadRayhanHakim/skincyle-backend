const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const authMiddleware = require("../middleware/authMiddleware");

// 1. Rute Public (Bisa diakses tanpa login)
router.get("/", forumController.getPosts);
router.get("/:id_posting", forumController.getPostDetail);

// --- PROTECTED ROUTES (Hanya untuk yang sudah login) ---
router.use(authMiddleware);

router.post("/", forumController.createPost);
// Tambahkan baris ini di bawah rute router.use(authMiddleware)
router.put("/:id_posting", forumController.updatePost); // <--- Tambahkan rute Edit
router.delete("/:id_posting", forumController.deletePost);
router.post("/comment/:id_posting", forumController.addComment);
router.post("/like/:id_posting", forumController.toggleLike);
router.delete("/:id_posting", forumController.deletePost);

module.exports = router;
