// routes/ai.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// routes/ai.js
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    console.log("API Key check:", process.env.OPENAI_API_KEY ? "Present" : "Missing");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY in environment");
      return res.status(500).json({ error: "Server configuration error: API key missing" });
    }

    console.log("✅ API key exists. Sending request to OpenRouter...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("AI Route Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});


module.exports = router;
