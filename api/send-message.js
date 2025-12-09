/**
 * Vercel Serverless Function
 * Sends a message and creates chat completion with Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY || 'key_91dba3204858e9738dcdeed28fca';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const RETELL_API_KEY = process.env.RETELL_API_KEY;

    if (!RETELL_API_KEY) {
      return res.status(500).json({ error: 'Missing RETELL_API_KEY env variable' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { chat_id, message } = body || {};

    if (!chat_id || !message) {
      return res.status(400).json({ error: 'chat_id and message are required' });
    }

    const response = await fetch('https://api.retellai.com/v2/chat-completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Retell-API-Key': RETELL_API_KEY
      },
      body: JSON.stringify({
        chat_id,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text(); // ✅ NUNCA json() en error
      console.error('Retell API error:', text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Error sending message:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
