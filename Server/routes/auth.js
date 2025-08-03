const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const authController = require('../controllers/authcontrol');
const authMiddleware = require('../middleware/authmiddleware');

const originalGet = router.get;
router.get = function (...args) {
  console.log(`[DEBUG] router.get in ${__filename} called with:`, args[0]);
  return originalGet.apply(this, args);
};

const originalPost = router.post;
router.post = function (...args) {
  console.log(`[DEBUG] router.post in ${__filename} called with:`, args[0]);
  return originalPost.apply(this, args);
};

const originalPut = router.put;
router.put = function (...args) {
  console.log(`[DEBUG] router.put in ${__filename} called with:`, args[0]);
  return originalPut.apply(this, args);
};

const originalDelete = router.delete;
router.delete = function (...args) {
  console.log(`[DEBUG] router.delete in ${__filename} called with:`, args[0]);
  return originalDelete.apply(this, args);
};

// router.get('/profile', authMiddleware, authController.getProfile);
// 📝 Doctor/Patient Signup & Login
router.post('/signup', upload.single('certificate'), authController.signup);
router.post('/login', authController.login);

// 📤 OTP-based Signup (User)
router.post('/user/create', authController.createUser);    // Send OTP & Save user
router.post('/user/verify', authController.otpverify);     // Verify OTP
router.post('/user/login', authController.loginUser);      // Login after OTP verified

// 🌐 Google Auth Callback
router.get('/auth/google/callback', authController.googleAuthCallback);  // For passport.js Google strategy

module.exports = router;
