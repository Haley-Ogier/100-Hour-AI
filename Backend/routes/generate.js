const express = require('express');
const groq = require('../lib/groq');

const router = express.Router();

/**
 * POST /api/generate
 * body: { "prompt": "Help me start a business" }
 */
router.post('/', async (req, res) => {
  const prompt = (req.body.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  try {
    const { data } = await groq.post('/chat/completions', {
      model: 'llama3-8b-8192',          // free fast model
      messages: [
        { role: 'system', content: 'You are a goal-setting coach.' },
        { role: 'user',   content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const answer = data.choices[0].message.content;
    res.json({ result: answer });
  } catch (err) {
    console.error('Groq error →', err.response?.data || err.message);
    res.status(500).json({ error: 'Groq API call failed' });
  }
});

module.exports = router;
