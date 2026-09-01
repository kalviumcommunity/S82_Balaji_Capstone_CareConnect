const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const authController = require('../controllers/authcontrol');
const { verifyToken } = require('../middleware/authmiddleware');

// 📝 Doctor / Patient / Admin - unified Login
router.post('/login', authController.login);
router.post('/verify-mfa', authController.verifyMfaLogin);

// 📝 Doctor / Patient Signup
router.post('/signup', upload.single('certificate'), authController.signup);

// 📤 OTP flow
router.post('/user/send-otp', authController.sendOtpForSignup); // Send OTP
router.post('/user/verify', authController.otpverify);            // Verify OTP

// 🔑 Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// 📖 Profile
// FIX: getprofile was fully implemented in authcontrol.js but never wired to
// a route — GET /api/auth/profile fell through to Express's default 404 page.
router.get('/profile', verifyToken, authController.getprofile);

module.exports = router;