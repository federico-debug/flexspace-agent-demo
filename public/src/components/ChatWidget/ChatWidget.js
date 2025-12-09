/**
 * ChatWidget Component
 * Chat interface for text-based conversations with Retell AI
 */
import { CONFIG } from '../../services/config.js';

export class ChatWidget {
  constructor(chatService) {
    this.chatService = chatService;
    this.element = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
    this.isProcessing = false;
  }

  /**
   * Create the chat widget element
   * @returns {HTMLElement}
   */
  create() {
    const widget = document.createElement('div');
    widget.className = 'chat-widget';

    // Chat header
    const header = document.createElement('div');
    header.className = 'chat-header';
    header.innerHTML = `
      <h3>${CONFIG.chatTitle}</h3>
      <div class="chat-status">
        <span class="status-dot"></span>
        <span class="status-text">Online</span>
      </div>
    `;

    // Messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'chat-messages';

    // Welcome message
    this.addWelcomeMessage();

    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input-container';

    this.inputField = document.createElement('textarea');
    this.inputField.className = 'chat-input';
    this.inputField.placeholder = `Message ${CONFIG.chatBotName}...`;
    this.inputField.rows = 1;

    this.sendButton = document.createElement('button');
    this.sendButton.className = 'chat-send-button';
    this.sendButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;

    inputContainer.appendChild(this.inputField);
    inputContainer.appendChild(this.sendButton);

    widget.appendChild(header);
    widget.appendChild(this.messagesContainer);
    widget.appendChild(inputContainer);

    this.element = widget;
    this.setupEventListeners();

    return widget;
  }

  /**
   * Add welcome message to chat
   */
  addWelcomeMessage() {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'chat-message bot-message';
    welcomeMsg.innerHTML = `
      <div class="message-avatar">
        <span>${CONFIG.chatBotName.charAt(0)}</span>
      </div>
      <div class="message-content">
        <div class="message-sender">${CONFIG.chatBotName}</div>
        <div class="message-text">Hi! I'm ${CONFIG.chatBotName}, your logistics assistant. How can I help you today?</div>
      </div>
    `;
    this.messagesContainer.appendChild(welcomeMsg);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => this.handleSendMessage());

    // Enter key to send (Shift+Enter for new line)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Auto-resize textarea
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = Math.min(this.inputField.scrollHeight, 120) + 'px';
    });

    // Chat service events
    this.chatService.on('messageReceived', (message) => {
      this.addBotMessage(message.content);
      this.setProcessing(false);
    });

    this.chatService.on('error', (error) => {
      this.showError(error.message);
      this.setProcessing(false);
    });
  }

  /**
   * Handle send message
   */
  async handleSendMessage() {
    const message = this.inputField.value.trim();

    if (!message || this.isProcessing) return;

    // Add user message to UI
    this.addUserMessage(message);
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Set processing state
    this.setProcessing(true);

    try {
      // Create chat session if not exists
      if (!this.chatService.isActiveChat()) {
        await this.chatService.createChat();
      }

      // Send message
      await this.chatService.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Failed to send message. Please try again.');
      this.setProcessing(false);
    }
  }

  /**
   * Add user message to chat
   * @param {string} text - Message text
   */
  addUserMessage(text) {
    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message user-message';
    msgElement.innerHTML = `
      <div class="message-content">
        <div class="message-sender">You</div>
        <div class="message-text">${this.escapeHtml(text)}</div>
      </div>
      <div class="message-avatar user-avatar">
        <span>Y</span>
      </div>
    `;
    this.messagesContainer.appendChild(msgElement);
    this.scrollToBottom();
  }

  /**
   * Add bot message to chat
   * @param {string} text - Message text
   */
  addBotMessage(text) {
    // Remove typing indicator if exists
    this.removeTypingIndicator();

    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message bot-message';
    msgElement.innerHTML = `
      <div class="message-avatar">
        <span>${CONFIG.chatBotName.charAt(0)}</span>
      </div>
      <div class="message-content">
        <div class="message-sender">${CONFIG.chatBotName}</div>
        <div class="message-text">${this.escapeHtml(text)}</div>
      </div>
    `;
    this.messagesContainer.appendChild(msgElement);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    if (this.messagesContainer.querySelector('.typing-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot-message typing-indicator';
    indicator.innerHTML = `
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
    this.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  /**
   * Remove typing indicator
   */
  removeTypingIndicator() {
    const indicator = this.messagesContainer.querySelector('.typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Set processing state
   * @param {boolean} processing - Is processing
   */
  setProcessing(processing) {
    this.isProcessing = processing;
    this.sendButton.disabled = processing;
    this.inputField.disabled = processing;

    if (processing) {
      this.showTypingIndicator();
      this.sendButton.classList.add('processing');
    } else {
      this.removeTypingIndicator();
      this.sendButton.classList.remove('processing');
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'chat-error';
    errorElement.textContent = message;
    this.messagesContainer.appendChild(errorElement);
    this.scrollToBottom();

    // Remove after 5 seconds
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear chat messages
   */
  clearMessages() {
    this.messagesContainer.innerHTML = '';
    this.addWelcomeMessage();
  }

  /**
   * Show/hide widget
   * @param {boolean} show - Show or hide
   */
  setVisible(show) {
    if (this.element) {
      this.element.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Mount the component
   * @param {HTMLElement} parent
   */
  mount(parent) {
    parent.appendChild(this.create());
  }

  /**
   * Unmount the component
   */
  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.chatService.isActiveChat()) {
      this.chatService.endChat();
    }
    this.unmount();
  }
}
