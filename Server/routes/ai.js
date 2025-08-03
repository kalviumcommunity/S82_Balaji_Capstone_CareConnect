const express = require('express');
const axios = require('axios');
const router = express.Router();
const { verifyToken } = require('../middleware/authmiddleware');


// ✅ AI Route (Protected)
// Remove verifyToken and authorizeRoles from AI route
router.post('/ai', async (req, res) => {
  try {
    const { model, messages } = req.body;
    if (!model || !messages) {
      return res.status(400).json({ error: "Model and messages are required" });
    }

    // We will assume the key is stored in OPENAI_API_KEY, even if it's OpenRouter
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing in environment variables" });
    }

    // Hardcode OpenRouter endpoint but use OPENAI_API_KEY
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    console.log("Using OpenRouter with OPENAI_API_KEY. Key starts with:", apiKey.slice(0, 7));

    const response = await axios.post(
      apiUrl,
      { model, messages },
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


module.exports = router;
