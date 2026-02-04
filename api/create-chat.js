/**
 * Vercel Serverless Function
 * Creates a new chat session with Retell AI
 *
 * NOTE: Each request creates a NEW chat to avoid mixing conversations
 * between different users (no server-side caching of chat IDs)
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

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
    // Use agent_id from environment (secure)
    const agent_id = RETELL_AGENT_ID;

    if (!agent_id) {
      return res.status(500).json({ error: 'Missing RETELL_AGENT_ID env variable' });
    }

    if (!RETELL_API_KEY) {
      return res.status(500).json({ error: 'Missing RETELL_API_KEY env variable' });
    }

    // Always create a NEW chat per request
    // This prevents mixing conversations between different users
    const response = await fetch('https://api.retellai.com/create-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({ agent_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create chat');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    console.error('❌ Error creating chat:', e);
    return res.status(500).json({ error: e.message });
  }
}
