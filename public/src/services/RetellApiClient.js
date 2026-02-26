/**
 * RetellApiClient - HTTP client for Retell AI API
 * Single Responsibility: Only handles HTTP communication with backend
 */
import { CONFIG } from './config.js';

export class RetellApiClient {
  /**
   * Create a new chat session
   * @param {boolean} [resetChat=false] - Force reset server-side cache
   * @param {string} [lang='en'] - Language code for agent selection
   * @returns {Promise<{chat_id: string}>}
   */
  async createChat(resetChat = false, lang = 'en', utm = {}, leadData = {}) {
    const response = await fetch(`${CONFIG.baseUrl}/api/create-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_chat: resetChat, lang, utm, leadData })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to create chat session');
    }

    return response.json();
  }

  /**
   * Send message and get completion
   * @param {string} chatId - Chat session ID
   * @param {string} message - Message content
   * @returns {Promise<Object>} API response with messages array
   */
  async sendMessage(chatId, message) {
    const response = await fetch(`${CONFIG.baseUrl}/api/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, message })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Get chat details/status
   * @param {string} chatId - Chat session ID
   * @returns {Promise<Object>} Chat details
   */
  async getChatDetails(chatId) {
    const response = await fetch(`${CONFIG.baseUrl}/api/get-chat?chat_id=${chatId}`, {
      method: 'GET'
    });

    if (!response.ok) {
      // Return ended status for 404 (chat was deleted/ended)
      if (response.status === 404) {
        return { status: 'ended', ended: true, chat_status: 'ended' };
      }
      throw new Error('Failed to get chat details');
    }

    return response.json();
  }

  /**
   * Send UTM params to capture endpoint (for Retell custom function retrieval)
   * Fire-and-forget — failures are logged but never block the chat flow
   * @param {string} chatId - Chat session ID
   * @param {Object} utm - UTM parameters
   */
  async captureUtm(chatId, utm) {
    try {
      await fetch(`${CONFIG.baseUrl}/api/capture-utm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, ...utm })
      });
    } catch (e) {
      console.warn('UTM capture failed (non-blocking):', e.message);
    }
  }

  /**
   * End chat session
   * @param {string} chatId - Chat session ID
   * @returns {Promise<Object>}
   */
  async endChat(chatId) {
    const response = await fetch(`${CONFIG.baseUrl}/api/end-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId })
    });

    if (!response.ok) {
      throw new Error('Failed to end chat');
    }

    return response.json();
  }
}
