const express = require('express');
const app = express();
const router = require('./routes/index');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');
const axios = require('axios');

app.use(cors({
  origin: [
    'https://care-connect-2.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

app.use(express.json());

// Your other routes
app.use('/api/auth', require('./routes/googleauth'));
app.use('/api', router);
app.use("/api/profile", require("./routes/profileroutes"));

app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});

// ✅ Add AI Route here
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

module.exports = app;
