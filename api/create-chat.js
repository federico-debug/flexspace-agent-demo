/**
 * Vercel Serverless Function
 * Creates a new chat session with Retell AI
 */

const RETELL_API_KEY = process.env.RETELL_API_KEY;

let currentChatId = null; // ✅ memoria en caliente de Vercel

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
    // Check if we should reset chat (when chat ended)
    const { agent_id, reset_chat } = req.body;
    
    if (reset_chat) {
      console.log('🔄 Resetting chat due to reset_chat flag');
      currentChatId = null;
    }

    // If we have a current chat, verify it's still active before reusing
    if (currentChatId && !reset_chat) {
      try {
        const checkResponse = await fetch(`https://api.retellai.com/v2/get-chat/${currentChatId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${RETELL_API_KEY}`,
          },
        });

        if (checkResponse.ok) {
          const chatData = await checkResponse.json();
          // Only reuse if chat is still ongoing
          if (chatData.chat_status === 'ongoing' || chatData.status === 'ongoing') {
            console.log('♻️ Reusing existing active chat:', currentChatId);
            return res.status(200).json({ chat_id: currentChatId });
          } else {
            console.log('⚠️ Existing chat ended, creating new one');
            currentChatId = null;
          }
        } else {
          // Chat not found or ended, clear it
          console.log('⚠️ Existing chat not found/ended, creating new one');
          currentChatId = null;
        }
      } catch (checkError) {
        // If check fails, clear and create new
        console.log('⚠️ Error checking chat status, creating new one');
        currentChatId = null;
      }
    }

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

    currentChatId = data.chat_id; // ✅ SE GUARDA EL CHAT

    console.log('✅ New chat created:', currentChatId);

    return res.status(200).json(data);
  } catch (e) {
    console.error('❌ Error creating chat:', e);
    return res.status(500).json({ error: e.message });
  }
}
