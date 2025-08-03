const express = require('express');
const cors = require('cors');
const passport = require('./config/passport'); // Google Strategy
require('dotenv').config();

const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const aiRoute = require('./routes/ai');

const app = express();
app.enable('trust proxy');

app.use(express.json());
app.use(cors({
  origin: ['https://capstone-careconnect1.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

// ✅ Initialize Passport (no sessions)
app.use(passport.initialize());

app.post('/api/ai-test', (req, res) => {
  console.log("AI Test route hit");
  return res.json({ status: "OK" });
});

// ✅ Routes
app.use('/api/auth', googleAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoute);
app.use('/api', mainRouter);

app.get('/', (req, res) => res.status(200).send('✅ Hello From Backend!'));

module.exports = app;
