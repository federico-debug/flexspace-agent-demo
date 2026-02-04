/**
 * ChatStateStore - Centralized state management for chat
 * Single Responsibility: Only manages chat state, no side effects
 *
 * @typedef {Object} Message
 * @property {'user'|'agent'} role
 * @property {string} content
 * @property {number} timestamp
 */
export class ChatStateStore {
  constructor() {
    /** @type {string|null} */
    this._chatId = null;

    /** @type {Message[]} */
    this._messages = [];

    /** @type {boolean} */
    this._isActive = false;

    /** @type {Object<string, any>} */
    this._variables = {};

    /** @type {number|null} */
    this._createdAt = null;

    /** @type {boolean} */
    this._shouldResetChat = false;
  }

  // --- Getters (read-only access) ---

  get chatId() {
    return this._chatId;
  }

  get messages() {
    return [...this._messages]; // Return copy for immutability
  }

  get isActive() {
    return this._isActive;
  }

  get variables() {
    return { ...this._variables }; // Return copy
  }

  get createdAt() {
    return this._createdAt;
  }

  get shouldResetChat() {
    return this._shouldResetChat;
  }

  // --- Setters ---

  set shouldResetChat(value) {
    this._shouldResetChat = value;
  }

  // --- State mutations ---

  /**
   * Initialize a new chat session
   * @param {string} chatId
   */
  initChat(chatId) {
    this._chatId = chatId;
    this._isActive = true;
    this._messages = [];
    this._createdAt = Date.now();
  }

  /**
   * Add a message to history
   * @param {'user'|'agent'} role
   * @param {string} content
   * @returns {Message} The created message
   */
  addMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: Date.now()
    };
    this._messages.push(message);
    return message;
  }

  /**
   * Set chat as ended
   */
  setEnded() {
    this._isActive = false;
  }

  /**
   * Set a variable
   * @param {string} name
   * @param {any} value
   */
  setVariable(name, value) {
    this._variables[name] = value;
  }

  /**
   * Clear all variables
   */
  clearVariables() {
    this._variables = {};
  }

  /**
   * Check if chat is active with valid ID
   * @returns {boolean}
   */
  isActiveChat() {
    return this._isActive && !!this._chatId;
  }

  /**
   * Check if chat was created recently (within ms)
   * @param {number} withinMs - Milliseconds threshold
   * @returns {boolean}
   */
  isRecentlyCreated(withinMs = 2000) {
    return this._createdAt && (Date.now() - this._createdAt) < withinMs;
  }

  /**
   * Reset all state
   */
  reset() {
    this._chatId = null;
    this._messages = [];
    this._isActive = false;
    this._variables = {};
    this._createdAt = null;
  }
}
