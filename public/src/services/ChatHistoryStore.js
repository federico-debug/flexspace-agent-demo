/**
 * ChatHistoryStore - Persists chat history to localStorage
 * Allows users to view their previous conversations
 */

const STORAGE_KEY = 'flexspace_chat_history';
const MAX_CHATS = 50; // Keep last 50 chats

export class ChatHistoryStore {
  constructor() {
    this.history = this.load();
  }

  /**
   * Load history from localStorage
   * @returns {Array} Array of chat sessions
   */
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  /**
   * Save history to localStorage
   */
  save() {
    try {
      // Keep only last MAX_CHATS
      const toSave = this.history.slice(-MAX_CHATS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  /**
   * Save a completed chat session
   * @param {string} chatId - Chat ID from Retell
   * @param {Array} messages - Array of messages
   * @param {Object} variables - Extracted variables
   */
  saveChat(chatId, messages, variables = {}) {
    if (!messages || messages.length === 0) return;

    const chatSession = {
      id: chatId || `local_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      })),
      variables,
      // Preview: first user message or first agent message
      preview: this.getPreview(messages)
    };

    // Check if chat already exists (update it)
    const existingIndex = this.history.findIndex(c => c.id === chatId);
    if (existingIndex >= 0) {
      this.history[existingIndex] = chatSession;
    } else {
      this.history.push(chatSession);
    }

    this.save();
    return chatSession;
  }

  /**
   * Get preview text for a chat
   * @param {Array} messages
   * @returns {string}
   */
  getPreview(messages) {
    // Find first meaningful message (skip "Hello" greeting)
    const userMsg = messages.find(m =>
      m.role === 'user' &&
      m.content &&
      m.content.toLowerCase() !== 'hello'
    );

    if (userMsg) {
      return userMsg.content.substring(0, 100) + (userMsg.content.length > 100 ? '...' : '');
    }

    // Fallback to first agent message
    const agentMsg = messages.find(m => m.role === 'agent' && m.content);
    if (agentMsg) {
      return agentMsg.content.substring(0, 100) + (agentMsg.content.length > 100 ? '...' : '');
    }

    return 'New conversation';
  }

  /**
   * Get all chat sessions (newest first)
   * @returns {Array}
   */
  getAll() {
    return [...this.history].reverse();
  }

  /**
   * Get a specific chat by ID
   * @param {string} chatId
   * @returns {Object|null}
   */
  getById(chatId) {
    return this.history.find(c => c.id === chatId) || null;
  }

  /**
   * Delete a chat by ID
   * @param {string} chatId
   */
  deleteChat(chatId) {
    this.history = this.history.filter(c => c.id !== chatId);
    this.save();
  }

  /**
   * Clear all history
   */
  clearAll() {
    this.history = [];
    this.save();
  }

  /**
   * Get chat count
   * @returns {number}
   */
  get count() {
    return this.history.length;
  }

  /**
   * Format date for display
   * @param {number} timestamp
   * @returns {string}
   */
  static formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}

// Singleton instance
export const chatHistoryStore = new ChatHistoryStore();
