const express = require('express');
const passport = require('passport');
const router = express.Router();

// 🔹 Google Auth Route
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 🔹 Google Callback Route
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // On success, redirect to front-end
    const token = req.user.token;
    res.redirect(`https://capstone-careconnect1.netlify.app/google-success?token=${token}`);
  }
);

module.exports = router;
