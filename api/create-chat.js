/**
 * Vercel Serverless Function
 * Creates a new chat session with Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY || 'key_91dba3204858e9738dcdeed28fca';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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
    const { agent_id } = body || {};

    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id is required' });
    }

    const response = await fetch('https://api.retellai.com/v2/create-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Retell-API-Key': RETELL_API_KEY
      },
      body: JSON.stringify({ agent_id })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Retell API error:', text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error creating chat:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
