/**
 * ChatWidget Component (Refactored)
 * Coordinates sub-components for chat interface
 *
 * Dependencies:
 * - MessageList: Handles message rendering
 * - ChatInput: Handles user input
 * - TypingIndicator: Shows typing animation
 * - ExampleQuestions: Shows starter suggestions
 */
import { CONFIG } from '../../services/config.js';
import { MessageList } from './MessageList.js';
import { ChatInput } from './ChatInput.js';
import { TypingIndicator } from './TypingIndicator.js';
import { ExampleQuestions } from '../ExampleQuestions/ExampleQuestions.js';
import { ChatHistory } from '../ChatHistory/ChatHistory.js';

export class ChatWidget {
  /**
   * @param {Object} chatService - Chat service instance (ChatOrchestrator)
   */
  constructor(chatService) {
    this.chatService = chatService;

    // Sub-components
    this.messageList = new MessageList();
    this.chatInput = new ChatInput(
      (msg) => this.handleSendMessage(msg),
      () => this.hideStarters()
    );
    this.typingIndicator = new TypingIndicator();
    this.startersComponent = null;
    this.historyPanel = null;

    // State
    this.element = null;
    this.startersFixedContainer = null;
    this.startersShown = false;
    this.isChatEnded = false;
    this.isProcessing = false;
    this.conversationEndedBanner = null;
  }

  /**
   * Create the chat widget element
   * @returns {HTMLElement}
   */
  create() {
    const widget = document.createElement('div');
    widget.className = 'chat-widget';

    // Header
    const header = document.createElement('div');
    header.className = 'chat-header';
    header.innerHTML = `
      <div class="chat-header-left">
        <button class="chat-history-btn" title="Chat History">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </button>
        <h3>${CONFIG.chatTitle}</h3>
      </div>
      <div class="chat-status">
        <span class="status-dot"></span>
        <span class="status-text">Online</span>
      </div>
    `;

    // History button event
    const historyBtn = header.querySelector('.chat-history-btn');
    historyBtn.addEventListener('click', () => this.toggleHistory());

    // Messages container
    const messagesContainer = this.messageList.create();
    this.typingIndicator.setContainer(messagesContainer);

    // Starters setup
    if (CONFIG.chatStarters?.length > 0) {
      this.startersComponent = new ExampleQuestions(
        CONFIG.chatStarters,
        (q) => this.handleStarterClick(q)
      );
    }

    this.startersFixedContainer = document.createElement('div');
    this.startersFixedContainer.className = 'chat-starters-fixed';
    this.startersFixedContainer.style.display = 'none';

    // Input container
    const inputContainer = this.chatInput.create();

    // History panel
    this.historyPanel = new ChatHistory(
      (chat) => this.loadHistoryChat(chat),
      () => this.historyPanel.hide()
    );

    // Assemble widget
    widget.appendChild(header);
    widget.appendChild(messagesContainer);
    widget.appendChild(this.startersFixedContainer);
    widget.appendChild(inputContainer);
    this.historyPanel.mount(widget);

    this.element = widget;
    this.setupServiceListeners();

    return widget;
  }

  /**
   * Setup chat service event listeners
   */
  setupServiceListeners() {
    this.chatService.on('messageReceived', (message) => {
      this.typingIndicator.hide();
      this.messageList.addBotMessage(message.content);
      this.setProcessing(false);

      // Show starters after first bot message
      if (this.startersComponent && !this.startersShown) {
        this.renderStarters();
      }
    });

    this.chatService.on('error', (error) => {
      this.messageList.showError(error.message);
      this.setProcessing(false);
    });

    this.chatService.on('chatEnded', () => this.handleChatEnded());
  }

  /**
   * Send initial greeting when widget opens
   */
  async sendInitialGreeting() {
    if (this.isProcessing || this.chatService.isActiveChat()) return;

    try {
      this.setProcessing(true);
      const shouldReset = this.chatService.shouldResetChat || false;
      await this.chatService.createChat(shouldReset);
      this.chatService.shouldResetChat = false;
      await this.chatService.sendMessage('Hello', true);
    } catch (error) {
      console.error('Error sending initial greeting:', error);
      this.setProcessing(false);
    }
  }

  /**
   * Handle send message
   * @param {string} message
   */
  async handleSendMessage(message) {
    if (!message || this.isProcessing || this.isChatEnded) return;

    this.hideStarters();
    this.messageList.addUserMessage(message);
    this.setProcessing(true);

    try {
      if (!this.chatService.isActiveChat()) {
        await this.chatService.createChat();
      }
      await this.chatService.sendMessage(message);
    } catch (error) {
      if (!error.message?.includes('Chat has ended')) {
        this.messageList.showError('Failed to send message. Please try again.');
      }
      this.setProcessing(false);
    }
  }

  /**
   * Handle starter question click
   * @param {string} question
   */
  async handleStarterClick(question) {
    if (this.isProcessing || this.isChatEnded) return;
    this.hideStarters();
    await this.handleSendMessage(question);
  }

  /**
   * Handle chat ended
   */
  handleChatEnded() {
    this.isChatEnded = true;
    this.chatInput.disable();
    this.conversationEndedBanner = this.messageList.showEndedBanner(
      () => this.handleStartNewConversation()
    );
  }

  /**
   * Start new conversation
   */
  async handleStartNewConversation() {
    this.clearMessages();
    this.isChatEnded = false;
    this.chatInput.enable();
    this.chatService.reset();
    this.chatService.shouldResetChat = true;
    await this.sendInitialGreeting();
  }

  /**
   * Set processing state
   * @param {boolean} processing
   */
  setProcessing(processing) {
    this.isProcessing = processing;
    if (!this.isChatEnded) {
      this.chatInput.setProcessing(processing);
    }
    if (processing) {
      this.typingIndicator.show();
    } else {
      this.typingIndicator.hide();
    }
  }

  renderStarters() {
    if (!this.startersComponent || this.startersShown) return;
    this.startersFixedContainer.innerHTML = '';
    this.startersFixedContainer.appendChild(this.startersComponent.render());
    this.startersFixedContainer.style.display = 'block';
    this.startersShown = true;
  }

  hideStarters() {
    if (this.startersFixedContainer) {
      this.startersFixedContainer.style.display = 'none';
      this.startersFixedContainer.innerHTML = '';
    }
  }

  clearMessages() {
    this.messageList.clear();
    this.startersShown = false;
    this.hideStarters();
    this.conversationEndedBanner = null;
    this.isChatEnded = false;
  }

  /**
   * Toggle history panel
   */
  toggleHistory() {
    if (this.historyPanel) {
      this.historyPanel.toggle();
    }
  }

  /**
   * Load a chat from history
   * @param {Object} chat - Chat object from history
   */
  loadHistoryChat(chat) {
    // Hide history panel
    this.historyPanel.hide();

    // Clear current messages
    this.clearMessages();

    // Display the historical messages (read-only)
    chat.messages.forEach(msg => {
      if (msg.role === 'user') {
        this.messageList.addUserMessage(msg.content);
      } else {
        this.messageList.addBotMessage(msg.content);
      }
    });

    // Show ended banner since this is a past conversation
    this.isChatEnded = true;
    this.chatInput.disable();
    this.conversationEndedBanner = this.messageList.showEndedBanner(
      () => this.handleStartNewConversation()
    );
  }

  mount(parent) {
    parent.appendChild(this.create());
  }

  destroy() {
    if (!this.chatService.isActiveChat()) {
      this.clearMessages();
    }
  }
}
