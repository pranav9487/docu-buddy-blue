import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DocuBuddy API' });
});

// Route to trigger webhook POST
app.post('/trigger-webhook', async (req, res) => {
  try {
    const webhookUrl = 'http://localhost:5678/webhook-test/7ab3fc01-2b98-45cb-98d1-6cd4728ed9a9';
    const mockData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      timestamp: Date.now(),
      random: Math.floor(Math.random() * 10000)
    };
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockData)
    });
    const result = await response.text();
    res.json({ status: 'success', webhookResponse: result });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});