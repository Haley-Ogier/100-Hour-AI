const axios = require('axios');

const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
  },
  timeout: 30_000          // 30-second safety net
});

module.exports = groqClient;
