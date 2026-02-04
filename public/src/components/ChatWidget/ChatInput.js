/**
 * ChatInput - Handles user input for chat
 * Single Responsibility: Only manages input field and send button
 */
import { CONFIG } from '../../services/config.js';

export class ChatInput {
  /**
   * @param {Function} onSend - Callback when message is sent
   * @param {Function} [onTyping] - Callback when user starts typing
   */
  constructor(onSend, onTyping = null) {
    this.onSend = onSend;
    this.onTyping = onTyping;

    /** @type {HTMLElement|null} */
    this.container = null;
    /** @type {HTMLTextAreaElement|null} */
    this.inputField = null;
    /** @type {HTMLButtonElement|null} */
    this.sendButton = null;
  }

  /**
   * Create the input container
   * @returns {HTMLElement}
   */
  create() {
    this.container = document.createElement('div');
    this.container.className = 'chat-input-container';

    // Textarea
    this.inputField = document.createElement('textarea');
    this.inputField.className = 'chat-input';
    this.inputField.placeholder = `Message ${CONFIG.chatBotName}...`;
    this.inputField.rows = 1;

    // Send button
    this.sendButton = document.createElement('button');
    this.sendButton.className = 'chat-send-button';
    this.sendButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;

    this.container.appendChild(this.inputField);
    this.container.appendChild(this.sendButton);

    this.setupEventListeners();

    return this.container;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => this.handleSend());

    // Enter to send, Shift+Enter for newline
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Auto-resize textarea
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = Math.min(this.inputField.scrollHeight, 120) + 'px';

      // Notify typing callback
      if (this.onTyping && this.inputField.value.trim().length > 0) {
        this.onTyping();
      }
    });
  }

  /**
   * Handle send action
   */
  handleSend() {
    const message = this.inputField.value.trim();
    if (!message) return;

    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Maintain focus
    this.inputField.focus();

    // Call callback
    this.onSend(message);
  }

  /**
   * Get current input value
   * @returns {string}
   */
  getValue() {
    return this.inputField?.value.trim() || '';
  }

  /**
   * Clear input field
   */
  clear() {
    if (this.inputField) {
      this.inputField.value = '';
      this.inputField.style.height = 'auto';
    }
  }

  /**
   * Focus input field
   */
  focus() {
    this.inputField?.focus();
  }

  /**
   * Enable input
   */
  enable() {
    if (this.inputField && this.sendButton) {
      this.inputField.disabled = false;
      this.inputField.readOnly = false;
      this.inputField.style.cursor = 'text';
      this.inputField.style.opacity = '1';
      this.inputField.placeholder = `Message ${CONFIG.chatBotName}...`;
      this.sendButton.disabled = false;
      this.focus();
    }
  }

  /**
   * Disable input (for ended conversation)
   */
  disable() {
    if (this.inputField && this.sendButton) {
      this.inputField.disabled = true;
      this.inputField.style.cursor = 'not-allowed';
      this.inputField.style.opacity = '0.6';
      this.inputField.placeholder = 'Conversation ended';
      this.sendButton.disabled = true;
    }
  }

  /**
   * Set processing state (while waiting for response)
   * @param {boolean} processing
   */
  setProcessing(processing) {
    if (this.inputField && this.sendButton) {
      this.sendButton.disabled = processing;
      this.inputField.readOnly = processing;
      this.inputField.style.cursor = processing ? 'not-allowed' : 'text';

      if (processing) {
        this.sendButton.classList.add('processing');
      } else {
        this.sendButton.classList.remove('processing');
        this.focus();
      }
    }
  }

  /**
   * Mount to parent element
   * @param {HTMLElement} parent
   */
  mount(parent) {
    parent.appendChild(this.create());
  }
}
