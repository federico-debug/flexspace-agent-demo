/**
 * Chat Agent Application
 * Initializes and coordinates chat widget components
 */
import { ChatWidget } from './components/ChatWidget/ChatWidget.js';
import { FloatingChatButton } from './components/FloatingChatButton/FloatingChatButton.js';
import { ChatService } from './services/chatService.js';

class ChatApp {
  constructor() {
    this.chatService = new ChatService();
    this.chatContainer = null;
    this.isChatWidgetOpen = false;
    this.components = {};
  }

  /**
   * Initialize the chat application
   */
  init() {
    console.log('💬 Chat Agent initialized');
    this.setupComponents();
    this.setupChatService();
  }

  /**
   * Setup chat UI components
   */
  setupComponents() {
    const body = document.body;

    // Chat Widget Container (floating)
    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'widget-container chat-widget-container';
    this.chatContainer.style.display = 'none'; // Hidden by default
    body.appendChild(this.chatContainer);

    // Chat Widget
    this.components.chatWidget = new ChatWidget(this.chatService);
    this.components.chatWidget.mount(this.chatContainer);

    // Floating Chat Button
    this.components.floatingButton = new FloatingChatButton(
      (isOpen) => this.toggleFloatingChat(isOpen)
    );
    this.components.floatingButton.mount(body);
  }

  /**
   * Setup Chat service callbacks
   */
  setupChatService() {
    // When chat ends (explicitly via endChat()), check if widget is closed to clean up
    this.chatService.on('chatEnded', () => {
      console.log('📞 Chat ended event received');
      // Only cleanup if widget is closed
      if (!this.isChatWidgetOpen) {
        this.cleanupChatConversation();
      } else {
        // If widget is still open, just mark that chat ended
        // The cleanup will happen when widget is closed
        console.log('💬 Widget still open, will cleanup when closed');
      }
    });
  }

  /**
   * Clean up chat conversation (messages, variables, state)
   * Only called when conversation explicitly ended AND widget is closed
   */
  cleanupChatConversation() {
    console.log('🧹 Cleaning up chat conversation');
    this.components.chatWidget.clearMessages();
    this.chatService.reset();
    // Force reset server-side chat cache on next creation
    this.chatService.shouldResetChat = true;
  }

  /**
   * Toggle floating chat widget
   * @param {boolean} isOpen - Is chat open
   */
  async toggleFloatingChat(isOpen) {
    console.log(`💬 Floating chat ${isOpen ? 'opened' : 'closed'}`);
    this.isChatWidgetOpen = isOpen;

    if (isOpen) {
      // Show floating UI
      this.chatContainer.classList.add('floating');
      this.chatContainer.style.display = 'flex';
      
      // Send initial greeting if no active chat
      if (!this.chatService.isActiveChat()) {
        // Small delay to ensure widget is fully rendered
        setTimeout(() => {
          this.components.chatWidget.sendInitialGreeting();
        }, 300);
      }
    } else {
      this.chatContainer.classList.remove('floating');
      this.chatContainer.style.display = 'none';
      
      // When widget closes, check if chat has ended in Retell AI
      // This detects automatic chat termination (e.g., after inactivity)
      if (this.chatService.isActiveChat()) {
        try {
          const chatEnded = await this.chatService.checkIfChatEnded();
          if (chatEnded) {
            // Chat ended, cleanup will happen via chatEnded event handler
            console.log('🧹 Chat ended automatically, cleaning up...');
          } else {
            // Chat still active, keep it for when widget reopens
            console.log('💬 Chat still active, keeping conversation');
          }
        } catch (error) {
          console.error('❌ Error checking chat status:', error);
          // On error, assume chat is still active
        }
      }
    }
  }
}

// Initialize chat app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const chatApp = new ChatApp();
  chatApp.init();
});
