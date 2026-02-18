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
        <img src="${CONFIG.baseUrl}/agent-avatar.png" alt="${CONFIG.chatBotName}" class="avatar-img" />
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
   * Add bot message with word-by-word streaming effect
   * @param {string} text - Full message content
   * @returns {Promise<void>} Resolves when streaming completes
   */
  addBotMessageStreaming(text) {
    if (!this.container) return Promise.resolve();

    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message bot-message';
    msgElement.innerHTML = `
      <div class="message-avatar">
        <img src="${CONFIG.baseUrl}/agent-avatar.png" alt="${CONFIG.chatBotName}" class="avatar-img" />
      </div>
      <div class="message-content">
        <div class="message-sender">${CONFIG.chatBotName}</div>
        <div class="message-text"><span class="streaming-cursor"></span></div>
      </div>
    `;

    this.container.appendChild(msgElement);
    this.scrollToBottom();

    const textEl = msgElement.querySelector('.message-text');
    const formattedText = this.formatter.format(text);

    // Split into words while preserving HTML tags
    const words = this._splitForStreaming(formattedText);

    return new Promise((resolve) => {
      let index = 0;

      const getDelay = (word) => {
        const clean = word.replace(/<[^>]*>/g, '').trim();
        // Long pause after sentence-ending punctuation
        if (/[.!?]$/.test(clean)) return 280 + Math.random() * 200;
        // Medium pause after commas, colons, semicolons
        if (/[,:;]$/.test(clean)) return 150 + Math.random() * 100;
        // Occasional "thinking" pause (~15% chance)
        if (Math.random() < 0.15) return 180 + Math.random() * 120;
        // Normal typing speed with human-like variance
        return 35 + Math.random() * 45;
      };

      const streamNext = () => {
        if (index >= words.length) {
          textEl.innerHTML = formattedText;
          this.scrollToBottom();
          resolve();
          return;
        }

        const partialHtml = words.slice(0, index + 1).join('');
        textEl.innerHTML = partialHtml + '<span class="streaming-cursor"></span>';
        const currentWord = words[index];
        index++;
        this.scrollToBottom();

        this._streamTimer = setTimeout(streamNext, getDelay(currentWord));
      };

      streamNext();
    });
  }

  /**
   * Cancel any active streaming animation
   */
  cancelStreaming() {
    if (this._streamTimer) {
      clearTimeout(this._streamTimer);
      this._streamTimer = null;
    }
  }

  /**
   * Split formatted HTML into streamable word chunks
   * Preserves HTML tags as atomic units
   * @param {string} html
   * @returns {string[]}
   */
  _splitForStreaming(html) {
    const result = [];
    let current = '';
    let inTag = false;

    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      if (char === '<') {
        inTag = true;
        current += char;
      } else if (char === '>') {
        inTag = false;
        current += char;
      } else if (!inTag && char === ' ') {
        current += ' ';
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) result.push(current);
    return result;
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
   * Show conversation ended banner with rating UI
   * @param {Function} onStartNew - Callback for "Start New" button
   * @param {Object} labels - i18n translation strings
   * @param {Function} [onRate] - Callback when user submits rating: ({ rating, comment }) => void
   * @returns {HTMLElement} The banner element
   */
  showEndedBanner(onStartNew, labels = {}, onRate = null) {
    if (!this.container) return null;

    const title = labels.conversationEnded || 'Conversation Ended';
    const subtitle = labels.conversationCompletedSubtitle || 'This conversation has been completed';
    const btnText = labels.startNewConversation || 'Start New Conversation';
    const rateTitle = labels.rateTitle || 'How was your experience?';
    const rateThankYou = labels.rateThankYou || 'Thanks for your feedback!';
    const rateCommentPlaceholder = labels.rateCommentPlaceholder || 'Any additional comments? (optional)';
    const rateSend = labels.rateSend || 'Send';

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
          <div class="conversation-ended-title">${title}</div>
          <div class="conversation-ended-subtitle">${subtitle}</div>
        </div>
        ${onRate ? `
        <div class="conversation-rating">
          <div class="rating-prompt">${rateTitle}</div>
          <div class="rating-buttons">
            <button class="rating-btn" data-rating="positive" aria-label="Thumbs up">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </button>
            <button class="rating-btn" data-rating="negative" aria-label="Thumbs down">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"></path>
                <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
              </svg>
            </button>
          </div>
          <div class="rating-comment-section" style="display: none;">
            <textarea class="rating-comment" placeholder="${rateCommentPlaceholder}" rows="2"></textarea>
            <button class="rating-submit-btn">${rateSend}</button>
          </div>
          <div class="rating-thank-you" style="display: none;">${rateThankYou}</div>
        </div>
        ` : ''}
        <button class="start-new-conversation-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          ${btnText}
        </button>
      </div>
    `;

    const startNewBtn = banner.querySelector('.start-new-conversation-btn');
    startNewBtn.addEventListener('click', onStartNew);

    // Wire up rating interaction
    if (onRate) {
      let selectedRating = null;
      const ratingSection = banner.querySelector('.conversation-rating');
      const commentSection = banner.querySelector('.rating-comment-section');
      const thankYou = banner.querySelector('.rating-thank-you');
      const ratingBtns = banner.querySelectorAll('.rating-btn');
      const commentInput = banner.querySelector('.rating-comment');
      const submitBtn = banner.querySelector('.rating-submit-btn');

      ratingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          selectedRating = btn.dataset.rating;
          ratingBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          commentSection.style.display = 'flex';
          this.scrollToBottom();
        });
      });

      const submitRating = () => {
        if (!selectedRating) return;
        const comment = commentInput?.value?.trim() || '';
        onRate({ rating: selectedRating, comment });
        // Show thank you, hide rating UI
        commentSection.style.display = 'none';
        banner.querySelector('.rating-prompt').style.display = 'none';
        banner.querySelector('.rating-buttons').style.display = 'none';
        thankYou.style.display = 'block';
        this.scrollToBottom();
      };

      submitBtn.addEventListener('click', submitRating);

      // Allow Enter in textarea to submit (Shift+Enter for newline)
      commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitRating();
        }
      });
    }

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
