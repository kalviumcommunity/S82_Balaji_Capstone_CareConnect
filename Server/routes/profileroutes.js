const express = require("express");
const router = express.Router();
const { uploadProfilePhoto,getProfile } = require("../controllers/profilecontroller");
const uploadProfileImageMiddleware = require("../middleware/profileupload");
const { verifyToken } = require("../middleware/authmiddleware");

const originalRouterUse = router.use;
router.use = function (...args) {
  console.log(`[DEBUG] router.use in ${__filename} called with:`, args[0]);
  return originalRouterUse.apply(this, args);
};

const originalRouterGet = router.get;
router.get = function (...args) {
  console.log(`[DEBUG] router.get in ${__filename} called with:`, args[0]);
  return originalRouterGet.apply(this, args);
};

// Profile photo upload route
router.get("/get-profile", getProfile);
router.post(
  "/upload-profile-photo",
  verifyToken,
  uploadProfileImageMiddleware.single("image"),
  uploadProfilePhoto
);


module.exports = router;
