
const express = require('express');
const app = express();
const router = require('./routes/index');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const googleAuthRoutes = require('./routes/googleauth');
app.use('/api/auth', googleAuthRoutes);

// Google OAuth setup

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
  origin: [
    'https://extraordinary-kitsune4-f05960.netlify.app',  // ✅ production
    'http://localhost:5173'     // ✅ dev frontend
  ],
  credentials: true
}));



app.use(express.json());
app.use('/api', router);

app.use('/uploads',express.static('uploads'));
app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});


module.exports = app;

