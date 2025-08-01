const express = require('express');
const app = express();
const mainRouter = require('./routes/index');
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
app.use('/api', mainRouter);
app.use('/api/profile', require('./routes/profileroutes'));
app.use('/uploads', express.static('uploads'));

// ✅ AI Route
const aiRouter = express.Router();

aiRouter.post("/ai", async (req, res) => {
  try {
    const { model, messages } = req.body;

    if (!model || !messages) {
      return res.status(400).json({ error: "Model and messages are required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("AI Route Error:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

app.use('/api', aiRouter); // ✅ Mount AI route

app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

module.exports = app;
