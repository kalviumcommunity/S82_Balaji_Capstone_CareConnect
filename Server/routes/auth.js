const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const authController = require('../controllers/authcontrol');

// 📝 Doctor / Patient / Admin - unified Login
router.post('/login', authController.login);
router.post('/verify-mfa', authController.verifyMfaLogin);

// 📝 Doctor / Patient Signup
router.post('/signup', upload.single('certificate'), authController.signup);

// 📤 OTP flow
router.post('/user/send-otp', authController.sendOtpForSignup); // Send OTP
router.post('/user/verify', authController.otpverify);            // Verify OTP

module.exports = router;
