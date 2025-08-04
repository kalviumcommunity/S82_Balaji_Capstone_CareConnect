const express = require('express');
const cors = require('cors');
const passport = require('./config/passport'); // Google Strategy
require('dotenv').config();

// Routers
const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const aiRoute = require('./routes/ai');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctorroute'); // ✅ For doctor listing (public)
const { verifyToken } = require('./middleware/authmiddleware');

const app = express();
app.enable('trust proxy');

// ✅ Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'https://capstone-careconnect4.netlify.app', // Production
    'http://localhost:5173' // Development
  ],
  credentials: true
}));
app.use(passport.initialize());

// ✅ Public Routes
app.use('/api/auth', googleAuthRoutes);  // Google Auth
app.use('/api/auth', authRoutes);        // Login & Signup
app.use('/api/ai', aiRoute);             // AI Chatbot (No Auth)
app.use('/api/doctors', doctorRoutes);   // Doctor listing (Public)

// ✅ Protected Routes
app.use('/api/profile', verifyToken, profileRoutes); // User profile
app.use('/api', verifyToken, mainRouter);            // Other protected APIs

// ✅ Health Check
app.get('/', (req, res) => res.status(200).send('✅ Hello From Backend!'));

// ✅ Static files (if needed)
app.use('/uploads', express.static('uploads'));

module.exports = app;
