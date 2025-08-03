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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY in environment");
      return res.status(500).json({ error: "Server configuration error: API key missing" });
    }

    console.log("[DEBUG] API Key present:", apiKey.startsWith("sk-") ? "Yes" : "No");
    console.log("[DEBUG] Request payload:", {
      model: "mistralai/mistral-7b-instruct",
      messages
    });

    // Dynamic Referer for local + production
    const referer = req.headers.origin || "http://localhost:5173";

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": referer, // Must match your frontend origin
      "X-Title": "CareConnect AI Chat"
    };

    console.log("[DEBUG] Request headers:", headers);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages
      },
      { headers }
    );

    console.log("[DEBUG] OpenRouter Response Status:", response.status);
    res.json(response.data);

  } catch (error) {
    console.error("❌ AI Route Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message }
    });
  }
});

module.exports = router;
