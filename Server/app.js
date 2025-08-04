const express = require('express');
const cors = require('cors');
const passport = require('./config/passport'); // Google Strategy
require('dotenv').config();

const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const aiRoute = require('./routes/ai');
const authroutes = require('./routes/auth');
const { verifyToken } = require('./middleware/authmiddleware'); // Assuming this is your auth

const app = express();
app.enable('trust proxy');

app.use(express.json());
app.use(cors({
  origin: ['https://capstone-careconnect4.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

// ✅ Initialize Passport (no sessions)
app.use(passport.initialize());

// ✅ Routes
app.use('/api/ai', aiRoute); // Public route (NO AUTH HERE)
app.use('/api/auth', googleAuthRoutes);
app.use('/api/auth', authroutes);
// Apply auth for protected routes only
app.use('/api/profile', verifyToken, profileRoutes);
app.use('/api', verifyToken, mainRouter);

app.get('/', (req, res) => res.status(200).send('✅ Hello From Backend!'));

module.exports = app;
