/**
 * ChatService
 * Handles Retell AI Chat API interactions
 */
import { CONFIG } from './config.js';

export class ChatService {
  constructor() {
    this.chatId = null;
    this.messages = [];
    this.isActive = false;
    this.listeners = {};
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Create a new chat session
   * @returns {Promise<string>} Chat ID
   */
  async createChat() {
    try {
      const response = await fetch('/api/create-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: CONFIG.chatAgentId
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create chat session');
      }
      

      const data = await response.json();
      this.chatId = data.chat_id;
      this.isActive = true;
      this.messages = [];

      console.log('✅ Chat session created:', this.chatId);
      this.emit('chatCreated', { chatId: this.chatId });

      return this.chatId;
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Send a message and get response
   * @param {string} message - User message
   * @returns {Promise<Object>} Chat completion response
   */
  async sendMessage(message) {
    if (!this.chatId || !this.isActive) {
      throw new Error('No active chat session. Create a chat first.');
    }

    try {
      // Add user message to local history
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      this.messages.push(userMessage);
      this.emit('messageSent', userMessage);

      // Send to API via serverless function
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: CONFIG.chatAgentId,
          chat_id: this.chatId,
          message: message
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to send message');
      }
      

      const data = await response.json();

      // Extract bot response from the response
      // The API returns the messages array with the conversation history
      let botContent = '';

if (typeof data.response === 'string') {
  botContent = data.response;
} 
else if (typeof data.output_text === 'string') {
  botContent = data.output_text;
} 
else {
  console.warn('⚠️ Unknown Retell response format:', data);
  botContent = 'No response received';
}


      const botMessage = {
        role: 'assistant',
        content: botContent || 'No response received',
        timestamp: Date.now()
      };
      this.messages.push(botMessage);
      this.emit('messageReceived', botMessage);

      return data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get chat details
   * @returns {Promise<Object>} Chat details
   */
  async getChatDetails() {
    if (!this.chatId) {
      throw new Error('No active chat session');
    }

    try {
      const response = await fetch(`https://api.retellai.com/v2/get-chat/${this.chatId}`, {
        method: 'GET',
        headers: {
          'X-Retell-API-Key': CONFIG.publicKey
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get chat details');
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error getting chat details:', error);
      throw error;
    }
  }

  /**
   * End the current chat session
   * @returns {Promise<void>}
   */
  async endChat() {
    if (!this.chatId || !this.isActive) {
      console.warn('⚠️ No active chat to end');
      return;
    }

    try {
      const response = await fetch(`https://api.retellai.com/v2/end-chat/${this.chatId}`, {
        method: 'POST',
        headers: {
          'X-Retell-API-Key': CONFIG.publicKey
        }
      });

      if (!response.ok) {
        throw new Error('Failed to end chat');
      }

      console.log('✅ Chat ended:', this.chatId);
      this.isActive = false;
      this.emit('chatEnded', { chatId: this.chatId });

      // Reset state
      this.chatId = null;
      this.messages = [];
    } catch (error) {
      console.error('❌ Error ending chat:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get all messages in current chat
   * @returns {Array} Messages array
   */
  getMessages() {
    return [...this.messages];
  }

  /**
   * Check if chat is active
   * @returns {boolean}
   */
  isActiveChat() {
    return this.isActive && !!this.chatId;
  }

  /**
   * Reset the service state
   */
  reset() {
    this.chatId = null;
    this.messages = [];
    this.isActive = false;
  }
}
