const express = require('express');
const axios = require('axios');
const router = express.Router();
const { verifyToken } = require('../middleware/authmiddleware');


// ✅ AI Route (Protected)
// Remove verifyToken and authorizeRoles from AI route
router.post('/api/ai', async (req, res) => {
  try {
    const { model, messages } = req.body;

    if (!model || !messages) {
      return res.status(400).json({ error: "Model and messages are required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
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
