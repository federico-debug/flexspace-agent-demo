/**
 * ChatHistory Component
 * Shows list of previous chat conversations
 */
import { ChatHistoryStore, chatHistoryStore } from '../../services/ChatHistoryStore.js';

export class ChatHistory {
  /**
   * @param {Function} onSelectChat - Callback when a chat is selected
   * @param {Function} onClose - Callback when panel is closed
   */
  constructor(onSelectChat, onClose) {
    this.onSelectChat = onSelectChat;
    this.onClose = onClose;
    this.element = null;
    // Use the singleton instance to ensure we see all saved chats
    this.historyStore = chatHistoryStore;
  }

  /**
   * Create the history panel
   * @returns {HTMLElement}
   */
  create() {
    this.element = document.createElement('div');
    this.element.className = 'chat-history-panel';

    this.render();
    return this.element;
  }

  /**
   * Render the history list
   */
  render() {
    const chats = this.historyStore.getAll();

    this.element.innerHTML = `
      <div class="chat-history-header">
        <h3>Chat History</h3>
        <button class="chat-history-close" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="chat-history-list">
        ${chats.length === 0
          ? '<div class="chat-history-empty">No previous conversations</div>'
          : chats.map(chat => this.renderChatItem(chat)).join('')
        }
      </div>
      ${chats.length > 0 ? `
        <div class="chat-history-footer">
          <button class="chat-history-clear">Clear All History</button>
        </div>
      ` : ''}
    `;

    this.setupEventListeners();
  }

  /**
   * Render a single chat item
   * @param {Object} chat
   * @returns {string}
   */
  renderChatItem(chat) {
    const date = ChatHistoryStore.formatDate(chat.timestamp);
    const messageCount = chat.messages.length;

    return `
      <div class="chat-history-item" data-chat-id="${chat.id}">
        <div class="chat-history-item-content">
          <div class="chat-history-item-preview">${this.escapeHtml(chat.preview)}</div>
          <div class="chat-history-item-meta">
            <span class="chat-history-item-date">${date}</span>
            <span class="chat-history-item-count">${messageCount} messages</span>
          </div>
        </div>
        <button class="chat-history-item-delete" data-chat-id="${chat.id}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector('.chat-history-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.onClose());
    }

    // Chat items
    const items = this.element.querySelectorAll('.chat-history-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't trigger if clicking delete button
        if (e.target.closest('.chat-history-item-delete')) return;

        const chatId = item.dataset.chatId;
        const chat = this.historyStore.getById(chatId);
        if (chat) {
          this.onSelectChat(chat);
        }
      });
    });

    // Delete buttons
    const deleteButtons = this.element.querySelectorAll('.chat-history-item-delete');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.dataset.chatId;
        if (confirm('Delete this conversation?')) {
          this.historyStore.deleteChat(chatId);
          this.render();
        }
      });
    });

    // Clear all button
    const clearBtn = this.element.querySelector('.chat-history-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Delete all chat history?')) {
          this.historyStore.clearAll();
          this.render();
        }
      });
    }
  }

  /**
   * Escape HTML for XSS protection
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show the panel
   */
  show() {
    if (this.element) {
      // Reload from localStorage to ensure we have the latest data
      this.historyStore.history = this.historyStore.load();
      this.render(); // Refresh list
      this.element.classList.add('visible');
    }
  }

  /**
   * Hide the panel
   */
  hide() {
    if (this.element) {
      this.element.classList.remove('visible');
    }
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.element) {
      if (this.element.classList.contains('visible')) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  /**
   * Mount to parent
   * @param {HTMLElement} parent
   */
  mount(parent) {
    parent.appendChild(this.create());
  }
}
