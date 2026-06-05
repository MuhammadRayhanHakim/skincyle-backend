const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const upload = require("../middleware/multerConfig");
router.get("/:id", profileController.getProfile);

router.put(
  "/:id",
  upload.single("foto_profil"),
  profileController.updateProfile,
);

router.delete("/:id/photo", profileController.deletePhotoProfile);

module.exports = router;
