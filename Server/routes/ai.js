const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error: OpenRouter key missing" });
    }


    // Dynamic Referer for local + production
    const referer = req.headers.origin || "http://localhost:5173";

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto", 
        messages
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": referer,
          "X-Title": "CareConnect AI Chat"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    return res.status(502).json({
      error: { message: "AI service is temporarily unavailable" }
    });
  }
});

module.exports = router;
