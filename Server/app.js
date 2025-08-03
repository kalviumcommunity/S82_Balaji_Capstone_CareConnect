const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport'); // ✅ Load strategy config
require('dotenv').config();

const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const aiRoute = require('./routes/ai');

const app = express();
app.enable('trust proxy');

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://capstone-careconnect1.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

// Sessions & Passport

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // secure: true if HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', googleAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoute);
app.use('/api', mainRouter);

app.get('/', (req, res) => res.status(200).send('✅ Hello From Backend!'));

module.exports = app;
