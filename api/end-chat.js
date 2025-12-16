/**
 * Vercel Serverless Function
 * End chat session with Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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
    const { chat_id } = req.body;
    
    if (!chat_id) {
      return res.status(400).json({ error: 'chat_id is required' });
    }

    const response = await fetch(`https://api.retellai.com/end-chat/${chat_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to end chat');
    }

    const data = await response.json();
    console.log('✅ Chat ended successfully:', chat_id);
    return res.status(200).json(data);
  } catch (e) {
    console.error('❌ Error ending chat:', e);
    return res.status(500).json({ error: e.message });
  }
}
