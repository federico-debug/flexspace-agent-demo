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
    this.variables = {}; // Store extracted variables from conversation
    this.shouldResetChat = false; // Flag to reset server-side chat cache
    this.chatCreatedAt = null; // Timestamp when chat was created
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
   * @param {boolean} resetChat - Force reset of server-side chat cache
   * @returns {Promise<string>} Chat ID
   */
  async createChat(resetChat = false) {
    try {
      // NOTE: agent_id is now handled server-side for security
      const response = await fetch('/api/create-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reset_chat: resetChat
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
      this.chatCreatedAt = Date.now(); // Store creation timestamp

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
   * @param {boolean} skipUserMessage - Skip adding user message to history (for initial greeting)
   * @returns {Promise<Object>} Chat completion response
   */
  async sendMessage(message, skipUserMessage = false) {
    if (!this.chatId || !this.isActive) {
      throw new Error('No active chat session. Create a chat first.');
    }

    try {
      // Add user message to local history (skip for empty initial greeting)
      if (!skipUserMessage && message.trim() !== '') {
        const userMessage = {
          role: 'user',
          content: message,
          timestamp: Date.now()
        };
        this.messages.push(userMessage);
        this.emit('messageSent', userMessage);
      }

      // Send to API via serverless function
      // NOTE: agent_id handled server-side for security
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          message: message
        })
      });

      if (!response.ok) {
        const text = await response.text();
        
        // Check if error is "Chat already ended"
        if (text.includes('Chat already ended') || text.includes('chat ended')) {
          console.log('✅ Chat ended detected in error response');
          this.isActive = false;
          this.emit('chatEnded', { chatId: this.chatId, autoEnded: true });
          throw new Error('Chat has ended');
        }
        
        throw new Error(text || 'Failed to send message');
      }
      

      const data = await response.json();

      // Check if chat ended in the response (some APIs return status in response)
      if (data.chat_status === 'ended' || data.status === 'ended' || data.ended === true) {
        console.log('✅ Chat ended detected in API response');
        this.isActive = false;
        this.emit('chatEnded', { chatId: this.chatId, autoEnded: true });
      }

      // Extract variables from response if available
      this.extractVariables(data);

      // Extract bot response from the response
      // The API returns the messages array with the conversation history
      let botContent = '';

      if (Array.isArray(data.messages)) {
        // Retell devuelve role = "agent"
        const lastAgentMsg = [...data.messages]
          .reverse()
          .find(msg => msg.role === 'agent' && msg.content);
      
        if (lastAgentMsg) {
          botContent = lastAgentMsg.content;
        }
      } 
      else if (typeof data.response === 'string') {
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
        role: 'agent',
        content: botContent || 'No response received',
        timestamp: Date.now()
      };
      this.messages.push(botMessage);
      this.emit('messageReceived', botMessage);

      // Proactively check if chat has ended after each message
      // This helps catch cases where the chat ended but wasn't explicitly indicated
      setTimeout(() => {
        if (this.isActive) {
          this.checkIfChatEnded().catch(err => {
            console.warn('⚠️ Error checking chat status:', err);
          });
        }
      }, 500); // Small delay to allow backend to update

      return data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Check if this is a "chat ended" error
      const errorMessage = error.message || '';
      if (errorMessage.includes('Chat already ended') || errorMessage.includes('chat ended')) {
        console.log('✅ Chat ended detected in catch block');
        this.isActive = false;
        this.emit('chatEnded', { chatId: this.chatId, autoEnded: true });
      } else {
        // Only emit generic error if it's not a chat ended error
      this.emit('error', error);
      }
      
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
      const response = await fetch(`/api/get-chat?chat_id=${this.chatId}`, {
        method: 'GET',
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
   * Check if chat has ended according to Retell AI
   * @returns {Promise<boolean>} True if chat has ended
   */
  async checkIfChatEnded() {
    if (!this.chatId || !this.isActive) {
      return false;
    }

    // Don't check immediately after creation (within 2 seconds)
    // This avoids false 404s when chat was just created
    if (this.chatCreatedAt && (Date.now() - this.chatCreatedAt) < 2000) {
      console.log('⏳ Chat too new, skipping status check');
      return false;
    }

    try {
      const chatDetails = await this.getChatDetails();
      
      // Check multiple possible fields that indicate chat ended
      // Common fields: ended_at, status, finished_at, end_time, is_ended
      // Also handle 404 case where chat was deleted/ended
      const isEnded = 
        chatDetails.status === 'ended' ||
        chatDetails.status === 'finished' ||
        chatDetails.status === 'completed' ||
        chatDetails.status === 'error' ||
        chatDetails.ended_at !== null && chatDetails.ended_at !== undefined ||
        chatDetails.finished_at !== null && chatDetails.finished_at !== undefined ||
        chatDetails.end_time !== null && chatDetails.end_time !== undefined ||
        chatDetails.is_ended === true ||
        chatDetails.finished === true ||
        chatDetails.chat_status === 'ended';

      if (isEnded) {
        console.log('✅ Chat has ended according to Retell AI');
        this.isActive = false;
        this.emit('chatEnded', { chatId: this.chatId, autoEnded: true });
        return true;
      }

      return false;
    } catch (error) {
      // If error is 404, chat was deleted/ended
      if (error.message && error.message.includes('404')) {
        console.log('✅ Chat not found (404), treating as ended');
        this.isActive = false;
        this.emit('chatEnded', { chatId: this.chatId, autoEnded: true });
        return true;
      }
      console.error('❌ Error checking if chat ended:', error);
      // If we can't check, assume chat is still active
      return false;
    }
  }

  /**
   * Extract variables from API response
   * @param {Object} data - API response data
   */
  extractVariables(data) {
    // Check multiple possible locations for variables in Retell AI response
    let vars = null;

    if (data.variables && typeof data.variables === 'object') {
      vars = data.variables;
    } else if (data.metadata?.variables && typeof data.metadata.variables === 'object') {
      vars = data.metadata.variables;
    } else if (data.extracted_variables && typeof data.extracted_variables === 'object') {
      vars = data.extracted_variables;
    } else if (data.state?.variables && typeof data.state.variables === 'object') {
      vars = data.state.variables;
    }

    if (vars) {
      // Prioritize key variables for personalization
      const priorityVars = ['first_name', 'last_name', 'email', 'company_name', 
                            'user_number', 'call_type', 'primary_service_type'];
      
      Object.keys(vars).forEach(key => {
        const value = vars[key];
        // Only store non-empty values
        if (value !== null && value !== undefined && value !== '') {
          this.setVariable(key, value);
          
          // Log priority variables for debugging
          if (priorityVars.includes(key)) {
            console.log(`📝 Extracted variable: ${key} = ${value}`);
          }
        }
      });

      // Emit event with all updated variables
      this.emit('variablesUpdated', this.getAllVariables());
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
      const response = await fetch('/api/end-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.chatId
        })
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
      this.chatCreatedAt = null;
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
   * Get a specific variable
   * @param {string} name - Variable name
   * @returns {*} Variable value or undefined
   */
  getVariable(name) {
    return this.variables[name];
  }

  /**
   * Get all variables
   * @returns {Object} All variables
   */
  getAllVariables() {
    return { ...this.variables };
  }

  /**
   * Set a variable
   * @param {string} name - Variable name
   * @param {*} value - Variable value
   */
  setVariable(name, value) {
    this.variables[name] = value;
    this.emit('variableUpdated', { name, value });
  }

  /**
   * Clear all variables
   */
  clearVariables() {
    this.variables = {};
    this.emit('variablesCleared');
  }

  /**
   * Reset the service state
   */
  reset() {
    this.chatId = null;
    this.messages = [];
    this.isActive = false;
    this.chatCreatedAt = null;
    this.clearVariables();
  }
}
