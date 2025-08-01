const express = require('express');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/authcontrol');
const router = express.Router();

// Added debug logging from AI-chatbot branch
router.get('/google', (req, res, next) => {
  console.log("✅ Google Login Route Hit");
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  (req, res, next) => {
    console.log("✅ Callback HIT");
    console.log("Cookies:", req.cookies);
    console.log("Session:", req.session);
    next();
  },
  passport.authenticate('google', { failureRedirect: '/' }),
  googleAuthCallback
);

module.exports = router;
