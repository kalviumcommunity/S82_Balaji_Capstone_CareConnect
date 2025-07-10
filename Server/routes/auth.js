const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const authController = require('../controllers/authcontrol');
const authMiddleware = require('../middleware/authmiddleware');


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
