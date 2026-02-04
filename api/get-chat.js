/**
 * Vercel Serverless Function
 * Get chat details from Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chat_id } = req.query;
    
    if (!chat_id) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    const response = await fetch(`https://api.retellai.com/get-chat/${chat_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!response.ok) {
      // If chat not found (404), return ended status
      // This is expected when chat was auto-closed by Retell
      if (response.status === 404) {
        return res.status(200).json({ 
          status: 'ended', 
          ended: true, 
          chat_status: 'ended' 
        });
      }
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to get chat');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    console.error('❌ Error getting chat:', e);
    return res.status(500).json({ error: e.message });
  }
}
