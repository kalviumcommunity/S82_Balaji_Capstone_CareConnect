const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/patient'); // Use your patient model or user schema
require('dotenv').config();

console.log("Google ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Secret:", process.env.GOOGLE_CLIENT_SECRET);
console.log("🛰️ GOOGLE_REDIRECT_URI =", process.env.GOOGLE_REDIRECT_URI);

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI // ✅ Use env variable for flexibility
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          fullName: profile.displayName,
          email,
          isActivated: true
        });
        await user.save();
      }

      done(null, { profile, user });
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
module.exports = passport;