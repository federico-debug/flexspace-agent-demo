/**
 * ChatOrchestrator - Coordinates chat operations
 * Maintains same public API as original ChatService for backward compatibility
 *
 * Dependencies injected:
 * - RetellApiClient: HTTP communication
 * - ChatStateStore: State management
 * - EventBus: Event pub/sub
 * - VariableExtractor: Response parsing
 */
import { EventBus } from '../utils/EventBus.js';
import { RetellApiClient } from './RetellApiClient.js';
import { ChatStateStore } from './ChatStateStore.js';
import { VariableExtractor } from './VariableExtractor.js';
import { chatHistoryStore } from './ChatHistoryStore.js';
import { CONFIG } from './config.js';

export class ChatOrchestrator {
  /**
   * @param {RetellApiClient} [apiClient]
   * @param {ChatStateStore} [stateStore]
   * @param {EventBus} [eventBus]
   * @param {VariableExtractor} [extractor]
   */
  constructor(
    apiClient = new RetellApiClient(),
    stateStore = new ChatStateStore(),
    eventBus = new EventBus(),
    extractor = new VariableExtractor()
  ) {
    this.apiClient = apiClient;
    this.state = stateStore;
    this.events = eventBus;
    this.extractor = extractor;
  }

  // ============================================
  // PUBLIC API (backward compatible with ChatService)
  // ============================================

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    this.events.on(event, callback);
  }

  /**
   * Emit event (for internal use, kept public for compatibility)
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    this.events.emit(event, data);
  }

  /**
   * Create a new chat session
   * @param {boolean} [resetChat=false] - Force reset server-side cache
   * @returns {Promise<string>} Chat ID
   */
  async createChat(resetChat = false) {
    try {
      const data = await this.apiClient.createChat(resetChat);

      this.state.initChat(data.chat_id);
      this.events.emit('chatCreated', { chatId: data.chat_id });
      return data.chat_id;

    } catch (error) {
      console.error('❌ Error creating chat:', error);
      this.events.emit('error', error);
      throw error;
    }
  }

  /**
   * Send a message and get response
   * @param {string} message - User message
   * @param {boolean} [skipUserMessage=false] - Skip adding user message to history
   * @returns {Promise<Object>} Chat completion response
   */
  async sendMessage(message, skipUserMessage = false) {
    if (!this.state.isActiveChat()) {
      throw new Error('No active chat session. Create a chat first.');
    }

    try {
      // Add user message to local history
      if (!skipUserMessage && message.trim() !== '') {
        const userMessage = this.state.addMessage('user', message);
        this.events.emit('messageSent', userMessage);
      }

      // Send to API
      const data = await this.apiClient.sendMessage(this.state.chatId, message);

      // Check if chat ended
      if (this.extractor.isChatEnded(data)) {
        this.saveToHistory(); // Save before marking as ended
        this.state.setEnded();
        this.events.emit('chatEnded', { chatId: this.state.chatId, autoEnded: true });
      }

      // Extract variables
      const vars = this.extractor.extract(data);
      if (vars) {
        Object.entries(vars).forEach(([key, value]) => {
          this.state.setVariable(key, value);
        });
        this.events.emit('variablesUpdated', this.state.variables);
      }

      // Extract bot response
      const botContent = this.extractor.extractBotResponse(data);
      const botMessage = this.state.addMessage('agent', botContent);

      // Apply configured delay before showing response (simulates natural typing)
      const delay = CONFIG.responseDelay || 0;
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      this.events.emit('messageReceived', botMessage);

      // Proactive check for chat end (with delay)
      setTimeout(() => {
        if (this.state.isActive) {
          this.checkIfChatEnded().catch(err => {
            console.warn('⚠️ Error checking chat status:', err);
          });
        }
      }, 500);

      return data;

    } catch (error) {
      console.error('❌ Error sending message:', error);

      // Check if this is a "chat ended" error
      if (this.extractor.isChatEnded(error.message || '')) {
        this.saveToHistory(); // Save before marking as ended
        this.state.setEnded();
        this.events.emit('chatEnded', { chatId: this.state.chatId, autoEnded: true });
      } else {
        this.events.emit('error', error);
      }

      throw error;
    }
  }

  /**
   * Get chat details
   * @returns {Promise<Object>}
   */
  async getChatDetails() {
    if (!this.state.chatId) {
      throw new Error('No active chat session');
    }

    try {
      return await this.apiClient.getChatDetails(this.state.chatId);
    } catch (error) {
      console.error('❌ Error getting chat details:', error);
      throw error;
    }
  }

  /**
   * Check if chat has ended according to Retell AI
   * @returns {Promise<boolean>}
   */
  async checkIfChatEnded() {
    if (!this.state.chatId || !this.state.isActive) {
      return false;
    }

    // Don't check immediately after creation
    if (this.state.isRecentlyCreated(2000)) {
      return false;
    }

    try {
      const chatDetails = await this.apiClient.getChatDetails(this.state.chatId);

      if (this.extractor.isChatEnded(chatDetails)) {
        this.saveToHistory(); // Save before marking as ended
        this.state.setEnded();
        this.events.emit('chatEnded', { chatId: this.state.chatId, autoEnded: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking if chat ended:', error);
      return false;
    }
  }

  /**
   * End the current chat session
   * @returns {Promise<void>}
   */
  async endChat() {
    if (!this.state.chatId || !this.state.isActive) {
      console.warn('⚠️ No active chat to end');
      return;
    }

    try {
      await this.apiClient.endChat(this.state.chatId);
      const chatId = this.state.chatId;
      this.state.reset();
      this.events.emit('chatEnded', { chatId });

    } catch (error) {
      console.error('❌ Error ending chat:', error);
      this.events.emit('error', error);
      throw error;
    }
  }

  // ============================================
  // COMPATIBILITY PROPERTIES & METHODS
  // ============================================

  /** @returns {string|null} */
  get chatId() {
    return this.state.chatId;
  }

  /** @returns {boolean} */
  get isActive() {
    return this.state.isActive;
  }

  /** @returns {Array} */
  get messages() {
    return this.state.messages;
  }

  /** @returns {Object} */
  get variables() {
    return this.state.variables;
  }

  /** @returns {boolean} */
  get shouldResetChat() {
    return this.state.shouldResetChat;
  }

  /** @param {boolean} value */
  set shouldResetChat(value) {
    this.state.shouldResetChat = value;
  }

  /**
   * Get all messages in current chat
   * @returns {Array}
   */
  getMessages() {
    return this.state.messages;
  }

  /**
   * Check if chat is active
   * @returns {boolean}
   */
  isActiveChat() {
    return this.state.isActiveChat();
  }

  /**
   * Get a specific variable
   * @param {string} name
   * @returns {*}
   */
  getVariable(name) {
    return this.state.variables[name];
  }

  /**
   * Get all variables
   * @returns {Object}
   */
  getAllVariables() {
    return this.state.variables;
  }

  /**
   * Set a variable
   * @param {string} name
   * @param {*} value
   */
  setVariable(name, value) {
    this.state.setVariable(name, value);
    this.events.emit('variableUpdated', { name, value });
  }

  /**
   * Clear all variables
   */
  clearVariables() {
    this.state.clearVariables();
    this.events.emit('variablesCleared');
  }

  /**
   * Reset the service state
   */
  reset() {
    // Save to history before resetting (if there are messages)
    this.saveToHistory();
    this.state.reset();
  }

  // ============================================
  // HISTORY METHODS
  // ============================================

  /**
   * Save current chat to history
   */
  saveToHistory() {
    if (this.state.messages.length > 0) {
      chatHistoryStore.saveChat(
        this.state.chatId,
        this.state.messages,
        this.state.variables
      );
    }
  }

  /**
   * Get chat history
   * @returns {Array} Array of past chats (newest first)
   */
  getHistory() {
    return chatHistoryStore.getAll();
  }

  /**
   * Get a specific chat from history
   * @param {string} chatId
   * @returns {Object|null}
   */
  getHistoryChat(chatId) {
    return chatHistoryStore.getById(chatId);
  }

  /**
   * Delete a chat from history
   * @param {string} chatId
   */
  deleteHistoryChat(chatId) {
    chatHistoryStore.deleteChat(chatId);
  }

  /**
   * Clear all history
   */
  clearHistory() {
    chatHistoryStore.clearAll();
  }

  /**
   * Get history count
   * @returns {number}
   */
  get historyCount() {
    return chatHistoryStore.count;
  }
}

// Default export for drop-in replacement
// Usage: import { ChatService } from './ChatOrchestrator.js'
export { ChatOrchestrator as ChatService };
