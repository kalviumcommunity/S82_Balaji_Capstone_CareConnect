const express = require('express');
const passport = require('passport');
const { googleAuthCallback } = require('../controllers/authcontrol');
const router = express.Router();

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
