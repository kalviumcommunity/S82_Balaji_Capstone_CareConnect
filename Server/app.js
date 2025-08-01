const express = require('express');
const app = express();
const router = require('./routes/index');
const cors = require('cors');
const axios = require('axios');

require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const googleAuthRoutes = require('./routes/googleauth');

app.enable('trust proxy');

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
    'https://care-connect-2.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', googleAuthRoutes);
app.use('/api', router);
app.use('/api/profile', require('./routes/profileroutes'));
app.use('/uploads', express.static('uploads'));

// ✅ AI Route
app.post('/api/ai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('AI Route Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});

module.exports = app;
