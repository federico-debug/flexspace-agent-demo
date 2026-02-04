/**
 * TypingIndicator - Shows animated typing dots
 * Single Responsibility: Only handles typing animation display
 */
import { CONFIG } from '../../services/config.js';

export class TypingIndicator {
  constructor() {
    /** @type {HTMLElement|null} */
    this.element = null;
    /** @type {HTMLElement|null} */
    this.container = null;
  }

  /**
   * Set the container where indicator will be shown
   * @param {HTMLElement} container
   */
  setContainer(container) {
    this.container = container;
  }

  /**
   * Show typing indicator
   */
  show() {
    if (!this.container) return;

    // Don't duplicate
    if (this.container.querySelector('.typing-indicator')) return;

    this.element = document.createElement('div');
    this.element.className = 'chat-message bot-message typing-indicator';
    this.element.innerHTML = `
      <div class="message-avatar">
        <span>${CONFIG.chatBotName.charAt(0)}</span>
      </div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.container.appendChild(this.element);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    } else if (this.container) {
      // Fallback: find and remove any indicator in container
      const indicator = this.container.querySelector('.typing-indicator');
      if (indicator) indicator.remove();
    }
  }

  /**
   * Check if indicator is visible
   * @returns {boolean}
   */
  isVisible() {
    return !!this.element && this.element.parentNode;
  }

  /**
   * Scroll container to bottom
   */
  scrollToBottom() {
    if (this.container) {
      setTimeout(() => {
        this.container.scrollTop = this.container.scrollHeight;
      }, 100);
    }
  }
}
