const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const axios = require('axios');
require('dotenv').config();

const mainRouter = require('./routes/index');
const googleAuthRoutes = require('./routes/googleauth');
const profileRoutes = require('./routes/profileroutes');
const { verifyToken, authorizeRoles } = require('./middleware/authmiddleware');
const aiRoute = require('./routes/ai');
require('./config/passport');

const app = express();
app.enable('trust proxy');

// ──────────────────────────────────────────────
// ✅ Session & Passport for Google OAuth
// ──────────────────────────────────────────────
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// ──────────────────────────────────────────────
// ✅ CORS Setup
// ──────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://capstone-careconnect1.netlify.app',
    'https://magical-scone-a26a49.netlify.app',
    'https://silver-mandazi-b73e3b.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());
app.post('/api/ai', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error with AI API:", error.response?.data || error.message);
    res.status(500).json({ error: "AI request failed", details: error.response?.data || error.message });
  }
});





// ──────────────────────────────────────────────
// ✅ Routes
// ──────────────────────────────────────────────
app.use('/api/auth', googleAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', mainRouter);
app.use('/uploads', express.static('uploads'));

// ──────────────────────────────────────────────
// ✅ AI Route (Protected)
// ──────────────────────────────────────────────
// Remove verifyToken and authorizeRoles from AI route



// ──────────────────────────────────────────────
// ✅ Health Check Route
// ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).send('✅ Hello From Backend!');
});

// ──────────────────────────────────────────────
// ✅ Start Server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
