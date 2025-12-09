/**
 * Vercel Serverless Function
 * Sends a message and creates chat completion with Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY || 'key_91dba3204858e9738dcdeed28fca';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chat_id, message } = req.body;

    if (!chat_id || !message) {
      return res.status(400).json({ error: 'chat_id and message are required' });
    }

    // Call Retell API to create chat completion
    const response = await fetch('https://api.retellai.com/v2/create-chat-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RETELL_API_KEY}`
      },
      body: JSON.stringify({
        chat_id,
        message
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Retell API error:', errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
