// routes/googleAuth.js
const express = require('express');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/authcontrol');
const router = express.Router();

router.get('/google', (req, res, next) => {
  console.log("✅ Google Login Route Hit");
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  googleAuthCallback
);

module.exports = router;
