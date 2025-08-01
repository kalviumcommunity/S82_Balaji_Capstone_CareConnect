const express = require("express");
const router = express.Router();
const { uploadProfilePhoto,getProfile } = require("../controllers/profilecontroller");
const uploadProfileImageMiddleware = require("../middleware/profileupload");
const { verifyToken } = require("../middleware/authmiddleware");


// Profile photo upload route
router.get("/get-profile", getProfile);
router.post(
  "/upload-profile-photo",
  verifyToken,
  uploadProfileImageMiddleware.single("image"),
  uploadProfilePhoto
);

module.exports = router;
