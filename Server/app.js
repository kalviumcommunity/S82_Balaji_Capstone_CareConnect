const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
app.enable('trust proxy');

// ✅ Apply CORS first
app.use(cors({
  origin: [
    'https://capstone-careconnect1.netlify.app',
    'https://magical-scone-a26a49.netlify.app',
    'https://silver-mandazi-b73e3b.netlify.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Parse JSON body
app.use(express.json());

// ✅ Session & Passport for Google OAuth
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
const aiRoute = require('./routes/ai');
app.use('/api', aiRoute);

const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
app.use('/api/auth', googleAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', mainRouter);
app.use('/uploads', express.static('uploads'));

// ✅ Health check
app.get('/', (req, res) => {
  res.status(200).send('✅ Hello From Backend!');
});

module.exports = app;
