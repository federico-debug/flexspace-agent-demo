/**
 * Vercel Serverless Function
 * Creates a new chat session with Retell AI
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
    const { agent_id } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id is required' });
    }

    // Call Retell API - using create-chat-completion to initialize chat
    const response = await fetch('https://api.retellai.com/create-chat-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RETELL_API_KEY}`
      },
      body: JSON.stringify({
        agent_id,
        message: '' // Empty message to initialize chat
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
    console.error('Error creating chat:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
