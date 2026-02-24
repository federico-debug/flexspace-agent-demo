/**
 * Vercel Serverless Function
 * End chat session with Retell AI via SDK
 */

import client from './_retellClient.js';

export default async function handler(req, res) {
  // CORS
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

    // SDK returns void (204 No Content) on success
    await client.chat.end(chat_id);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('❌ Error ending chat:', e);
    const status = e.status || 500;
    return res.status(status).json({ error: e.message });
  }
}
