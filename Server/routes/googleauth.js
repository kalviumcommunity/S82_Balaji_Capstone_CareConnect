const express = require('express');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/authcontrol');
const router = express.Router();
console.log("✅ googleauth.js loaded");


// ✅ Step 1: Redirect to Google
router.get('/google', (req, res, next) => {
  console.log("✅ Google Login Route Hit");
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));


// ✅ Step 2: Callback from Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  googleAuthCallback
);




module.exports = router;
