const express = require("express");
const router = express.Router();
const { uploadProfilePhoto, getProfile, toggleMfa } = require("../controllers/profilecontroller");
const uploadProfileImageMiddleware = require("../middleware/profileupload");
const { verifyToken } = require("../middleware/authmiddleware");

// Get profile (auth applied at mount point in app.js, but also here for safety)
router.get("/get-profile", getProfile);

// Profile photo upload
router.post(
  "/upload-profile-photo",
  uploadProfileImageMiddleware.single("image"),
  uploadProfilePhoto
);

// Toggle MFA
router.post("/toggle-mfa", toggleMfa);

module.exports = router;
