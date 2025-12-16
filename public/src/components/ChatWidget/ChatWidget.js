/**
 * ChatWidget Component
 * Chat interface for text-based conversations with Retell AI
 */
import { CONFIG } from '../../services/config.js';
import { ExampleQuestions } from '../ExampleQuestions/ExampleQuestions.js';

export class ChatWidget {
  constructor(chatService) {
    this.chatService = chatService;
    this.element = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
    this.isProcessing = false;
    this.startersContainer = null;
    this.startersComponent = null;
    this.startersShown = false; // Flag to track if starters were already shown
    this.startersFixedContainer = null; // Fixed container for starters above input
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

    // ❌ QUITAMOS EL WELCOME HARDCODEADO
    // this.addWelcomeMessage();

    // Starters component (will be shown after agent's first message)
    if (CONFIG.chatStarters && CONFIG.chatStarters.length > 0) {
      this.startersComponent = new ExampleQuestions(
        CONFIG.chatStarters,
        (question) => this.handleStarterClick(question)
      );
    }

    // Fixed container for starters (above input)
    this.startersFixedContainer = document.createElement('div');
    this.startersFixedContainer.className = 'chat-starters-fixed';
    this.startersFixedContainer.style.display = 'none'; // Hidden initially

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
    widget.appendChild(this.startersFixedContainer); // Fixed starters above input
    widget.appendChild(inputContainer);

    this.element = widget;
    this.setupEventListeners();

    return widget;
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
      
      // Hide starters when user starts typing
      if (this.inputField.value.trim().length > 0) {
        this.hideStarters();
      }
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
   * Send initial greeting message when widget opens
   */
  async sendInitialGreeting() {
    if (this.isProcessing || this.chatService.isActiveChat()) {
      return; // Don't send if already processing or chat exists
    }

    try {
      this.setProcessing(true);
      
      // Create chat first - reset if needed
      const shouldReset = this.chatService.shouldResetChat || false;
      console.log('🟢 Creating chat and sending initial greeting...');
      await this.chatService.createChat(shouldReset);
      this.chatService.shouldResetChat = false; // Clear flag after use
      
      // Send greeting message to trigger agent's initial response
      // Using a simple greeting that agent can respond to
      // skipUserMessage=true so it doesn't show in UI as user message
      await this.chatService.sendMessage('Hello', true);
      
    } catch (error) {
      console.error('Error sending initial greeting:', error);
      // Don't show error to user, just log it
      this.setProcessing(false);
    }
  }

  /**
   * Handle starter button click
   * @param {string} question - Starter question text
   */
  async handleStarterClick(question) {
    if (this.isProcessing) return;

    // Hide starters immediately
    this.hideStarters();
    
    // Add user message to UI
    this.addUserMessage(question);
    
    // Set processing state
    this.setProcessing(true);

    try {
      // Create chat if needed
      if (!this.chatService.isActiveChat()) {
        console.log('🟢 Creating chat from starter...');
        await this.chatService.createChat();
      }

      // Send message
      await this.chatService.sendMessage(question);
    } catch (error) {
      console.error('Error sending starter message:', error);
      this.showError('Failed to send message. Please try again.');
      this.setProcessing(false);
    }
  }

  /**
   * Handle send message
   */
  async handleSendMessage() {
    const message = this.inputField.value.trim();

    if (!message || this.isProcessing) return;

    // Hide starters if first message
    this.hideStarters();

    // Add user message to UI
    this.addUserMessage(message);
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Maintain focus on input field
    this.inputField.focus();

    // Set processing state
    this.setProcessing(true);

    try {
      // ✅ SOLO ACÁ SE CREA EL CHAT
      if (!this.chatService.isActiveChat()) {
        console.log('🟢 Creating chat from first message...');
        await this.chatService.createChat();
      }

      // ✅ Luego se envía el mensaje
      await this.chatService.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Failed to send message. Please try again.');
      this.setProcessing(false);
    }
  }

  /**
   * Add user message to chat
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
   */
  addBotMessage(text) {
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
    
    // Show starters after first bot message only if never shown before
    if (this.startersComponent && !this.startersShown) {
      this.renderStarters();
    }
    
    this.scrollToBottom();
  }

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

  removeTypingIndicator() {
    const indicator = this.messagesContainer.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  }

  setProcessing(processing) {
    this.isProcessing = processing;
    this.sendButton.disabled = processing;
    
    // Use readOnly instead of disabled to maintain focus
    // This prevents user input while keeping focus and cursor visible
    this.inputField.readOnly = processing;
    if (processing) {
      this.inputField.style.cursor = 'not-allowed';
    } else {
      this.inputField.style.cursor = 'text';
      // Ensure focus is maintained after processing ends
      this.inputField.focus();
    }

    if (processing) {
      this.showTypingIndicator();
      this.sendButton.classList.add('processing');
    } else {
      this.removeTypingIndicator();
      this.sendButton.classList.remove('processing');
    }
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'chat-error';
    errorElement.textContent = message;
    this.messagesContainer.appendChild(errorElement);
    this.scrollToBottom();

    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  mount(parent) {
    parent.appendChild(this.create());
  }

  /**
   * Render and append starters to fixed container
   */
  renderStarters() {
    if (this.startersComponent && !this.startersShown && this.startersFixedContainer) {
      // Clear previous if any
      this.startersFixedContainer.innerHTML = '';
      
      // Render starters
      this.startersContainer = this.startersComponent.render();
      this.startersContainer.style.padding = '16px 24px';
      
      // Add to fixed container
      this.startersFixedContainer.appendChild(this.startersContainer);
      this.startersFixedContainer.style.display = 'block'; // Show container
      
      this.startersShown = true; // Mark as shown
    }
  }

  /**
   * Hide and remove starters container
   */
  hideStarters() {
    if (this.startersFixedContainer) {
      this.startersFixedContainer.style.display = 'none';
      this.startersFixedContainer.innerHTML = '';
    }
    this.startersContainer = null;
  }

  /**
   * Show starters container
   */
  showStarters() {
    if (this.startersContainer) {
      this.startersContainer.style.display = 'block';
    }
  }

  /**
   * Clear all messages from the chat
   */
  clearMessages() {
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
      this.startersShown = false; // Reset flag to allow starters again
      this.hideStarters(); // Hide starters
      // Starters will reappear when agent sends first message
    }
  }

  destroy() {
    // Don't automatically end chat - only clear UI if chat already ended
    if (!this.chatService.isActiveChat()) {
      this.clearMessages();
    }
  }
}
