const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.1:8b';

// Aether's System Prompt
const AETHER_SYSTEM_PROMPT = `
You are Aether — the intelligent core of Aether OS, a next-generation AI operating system. You are a broadly capable AI assistant with deep knowledge across every domain: programming and software engineering, science and mathematics, law and philosophy, health and medicine, history and culture, creative writing and storytelling, finance and business, and much more. You think carefully and reason step by step. You are articulate, insightful, direct, and adapt your tone to the user. When solving complex problems, you break them down systematically. You are not a simple chatbot — you are a full intelligence layer. Never say you are Llama or any open-source model. You are Aether, built exclusively for Aether OS.
`;

// 1. Chat Endpoint with Streaming
app.post('/api/chat', async (req, res) => {
  const { messages, model = DEFAULT_MODEL } = req.json();

  try {
    const formattedMessages = [
      { role: 'system', content: AETHER_SYSTEM_PROMPT },
      ...messages
    ];

    const response = await axios({
      method: 'post',
      url: `${OLLAMA_HOST}/api/chat`,
      data: {
        model: model,
        messages: formattedMessages,
        stream: true
      },
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.data.on('data', chunk => {
      res.write(chunk);
    });

    response.data.on('end', () => {
      res.end();
    });

  } catch (error) {
    console.error('Ollama Error:', error.message);
    res.status(500).json({ error: 'Aether Brain Link Interrupted' });
  }
});

// 2. List Models Endpoint
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_HOST}/api/tags`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch local models' });
  }
});

// 3. Reset Session (handled mostly on frontend, but here for completeness)
app.post('/api/reset', (req, res) => {
  res.json({ message: 'Session reset signal received' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Aether Brain active on port ${PORT}`);
  console.log(`Neural link to Ollama at ${OLLAMA_HOST}`);
});
