/**
 * Vercel Serverless Function
 * Creates a new chat session with Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;

let currentChatId = null; // ✅ memoria en caliente de Vercel

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (currentChatId) {
      console.log('♻️ Reusing existing chat:', currentChatId);
      return res.status(200).json({ chat_id: currentChatId });
    }

    const RETELL_API_KEY = process.env.RETELL_API_KEY;
    const { agent_id } = req.body;

    const response = await fetch('https://api.retellai.com/create-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RETELL_API_KEY}`,
      },
      body: JSON.stringify({ agent_id }),
    });

    const data = await response.json();

    currentChatId = data.chat_id; // ✅ SE GUARDA EL CHAT

    console.log('✅ New chat created:', currentChatId);

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
