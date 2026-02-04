/**
 * MessageList - Renders and manages chat messages
 * Single Responsibility: Only handles message display
 */
import { CONFIG } from '../../services/config.js';
import { MessageFormatter } from './MessageFormatter.js';

export class MessageList {
  /**
   * @param {MessageFormatter} [formatter]
   */
  constructor(formatter = new MessageFormatter()) {
    this.formatter = formatter;
    /** @type {HTMLElement|null} */
    this.container = null;
  }

  /**
   * Create the messages container
   * @returns {HTMLElement}
   */
  create() {
    this.container = document.createElement('div');
    this.container.className = 'chat-messages';
    return this.container;
  }

  /**
   * Add user message to chat
   * @param {string} text - Message content
   */
  addUserMessage(text) {
    if (!this.container) return;

    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message user-message';
    msgElement.innerHTML = `
      <div class="message-content">
        <div class="message-sender">You</div>
        <div class="message-text">${this.formatter.format(text)}</div>
      </div>
      <div class="message-avatar user-avatar">
        <span>Y</span>
      </div>
    `;

    this.container.appendChild(msgElement);
    this.scrollToBottom();
  }

  /**
   * Add bot message to chat
   * @param {string} text - Message content
   */
  addBotMessage(text) {
    if (!this.container) return;

    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message bot-message';
    msgElement.innerHTML = `
      <div class="message-avatar">
        <span>${CONFIG.chatBotName.charAt(0)}</span>
      </div>
      <div class="message-content">
        <div class="message-sender">${CONFIG.chatBotName}</div>
        <div class="message-text">${this.formatter.format(text)}</div>
      </div>
    `;

    this.container.appendChild(msgElement);
    this.scrollToBottom();
  }

  /**
   * Show error message
   * @param {string} message
   */
  showError(message) {
    if (!this.container) return;

    const errorElement = document.createElement('div');
    errorElement.className = 'chat-error';
    errorElement.textContent = message;
    this.container.appendChild(errorElement);
    this.scrollToBottom();

    // Auto-remove after 5 seconds
    setTimeout(() => errorElement.remove(), 5000);
  }

  /**
   * Show conversation ended banner
   * @param {Function} onStartNew - Callback for "Start New" button
   * @returns {HTMLElement} The banner element
   */
  showEndedBanner(onStartNew) {
    if (!this.container) return null;

    const banner = document.createElement('div');
    banner.className = 'conversation-ended-banner';
    banner.innerHTML = `
      <div class="conversation-ended-content">
        <div class="conversation-ended-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="conversation-ended-text">
          <div class="conversation-ended-title">Conversation Ended</div>
          <div class="conversation-ended-subtitle">This conversation has been completed</div>
        </div>
        <button class="start-new-conversation-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Start New Conversation
        </button>
      </div>
    `;

    const startNewBtn = banner.querySelector('.start-new-conversation-btn');
    startNewBtn.addEventListener('click', onStartNew);

    this.container.appendChild(banner);
    this.scrollToBottom();

    return banner;
  }

  /**
   * Clear all messages
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    if (this.container) {
      setTimeout(() => {
        this.container.scrollTop = this.container.scrollHeight;
      }, 100);
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
