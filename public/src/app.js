/**
 * Main Application Orchestrator
 * Initializes and coordinates all components and services
 */
import { Header } from './components/Header/Header.js';
import { WidgetSelector } from './components/WidgetSelector/WidgetSelector.js';
import { VoiceWave } from './components/VoiceWave/VoiceWave.js';
import { StatusBadge } from './components/StatusBadge/StatusBadge.js';
import { StatusDisplay } from './components/StatusDisplay/StatusDisplay.js';
import { CallControls } from './components/CallControls/CallControls.js';
import { ExampleQuestions } from './components/ExampleQuestions/ExampleQuestions.js';
import { ChatWidget } from './components/ChatWidget/ChatWidget.js';
import { FloatingChatButton } from './components/FloatingChatButton/FloatingChatButton.js';
import { RetellClientService } from './services/retellClient.js';
import { ChatService } from './services/chatService.js';
import { Timer } from './utils/timer.js';

class App {
  constructor() {
    this.components = {};
    this.retellService = new RetellClientService();
    this.chatService = new ChatService();
    this.timer = null;
    this.currentMode = 'voice'; // 'voice' or 'chat'
    this.voiceContainer = null;
    this.chatContainer = null;
    this.isChatWidgetOpen = false; // Track if chat widget is open
  }

  /**
   * Initialize the application
   */
  init() {
    console.log('🎯 Retell Web Call Demo initialized');
    this.setupComponents();
    this.setupRetellService();
    this.setupChatService();
  }

  /**
   * Setup all UI components
   */
  setupComponents() {
    const body = document.body;

    // Header
    this.components.header = new Header();
    this.components.header.mount(body);

    // Main container
    const container = document.createElement('div');
    container.className = 'container';

    const content = document.createElement('div');
    content.className = 'content';

    // Widget Selector (Voice/Chat tabs)
    this.components.widgetSelector = new WidgetSelector(
      (mode) => this.switchMode(mode)
    );
    this.components.widgetSelector.mount(content);

    // Voice Widget Container
    this.voiceContainer = document.createElement('div');
    this.voiceContainer.className = 'widget-container voice-widget-container';

    // Status Badge
    this.components.statusBadge = new StatusBadge();
    this.components.statusBadge.mount(this.voiceContainer);

    // Voice Wave
    this.components.voiceWave = new VoiceWave();
    this.components.voiceWave.mount(this.voiceContainer);

    // Status Display
    this.components.statusDisplay = new StatusDisplay();
    this.components.statusDisplay.mount(this.voiceContainer);

    // Call Controls
    this.components.callControls = new CallControls(
      () => this.handleStartCall(),
      () => this.handleEndCall()
    );
    this.components.callControls.mount(this.voiceContainer);

    // Example Questions
    this.components.exampleQuestions = new ExampleQuestions(
      null, // Use default questions
      (question) => this.handleQuestionClick(question)
    );
    this.components.exampleQuestions.mount(this.voiceContainer);

    // Chat Widget Container
    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'widget-container chat-widget-container';
    this.chatContainer.style.display = 'none'; // Hidden by default

    // Chat Widget
    this.components.chatWidget = new ChatWidget(this.chatService);
    this.components.chatWidget.mount(this.chatContainer);

    // Append containers
    content.appendChild(this.voiceContainer);
    content.appendChild(this.chatContainer);

    container.appendChild(content);
    body.appendChild(container);

    // Setup timer
    this.timer = new Timer((duration) => {
      this.components.statusDisplay.updateTimer(duration);
    });

    // Floating Chat Button
    this.components.floatingButton = new FloatingChatButton(
      (isOpen) => this.toggleFloatingChat(isOpen)
    );
    this.components.floatingButton.mount(body);
  }

  /**
   * Setup Retell service callbacks
   */
  setupRetellService() {
    this.retellService.on('callStarted', () => {
      this.showConnectedState();
      this.timer.start();
    });

    this.retellService.on('callEnded', () => {
      this.resetToInitialState();
    });

    this.retellService.on('error', (error) => {
      this.components.statusDisplay.showError(
        error.message || 'An error occurred during the call'
      );
      this.resetToInitialState();
    });
  }

  /**
   * Setup Chat service callbacks
   */
  setupChatService() {
    // When chat ends (explicitly via endChat()), check if widget is closed to clean up
    // Note: This only fires if endChat() is called explicitly, not when widget is just closed
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
   * Handle start call button click
   */
  async handleStartCall() {
    try {
      this.components.callControls.setConnecting(true);
      this.components.statusDisplay.hideError();

      await this.retellService.startCall();
    } catch (error) {
      console.error('❌ Error starting call:', error);
      this.components.statusDisplay.showError(
        error.message || 'Failed to start call. Please try again.'
      );
      this.resetToInitialState();
    }
  }

  /**
   * Handle end call button click
   */
  handleEndCall() {
    this.retellService.stopCall();
    this.resetToInitialState();
  }

  /**
   * Handle example question click
   */
  handleQuestionClick(question) {
    console.log('📝 Selected question:', question);
    // Store the question for later use
    sessionStorage.setItem('selectedQuestion', question);
    // Start the call
    this.handleStartCall();
  }

  /**
   * Show connected state UI
   */
  showConnectedState() {
    this.components.statusDisplay.showConnected();
    this.components.callControls.setConnected(true);
  }

  /**
   * Reset to initial state UI
   */
  resetToInitialState() {
    this.components.statusDisplay.showInitial();
    this.components.callControls.setConnected(false);
    this.timer.stop();
  }

  /**
   * Switch between voice and chat modes
   * @param {string} mode - 'voice' or 'chat'
   */
  switchMode(mode) {
    console.log(`🔄 Switching to ${mode} mode`);
    this.currentMode = mode;

    if (mode === 'voice') {
      this.voiceContainer.style.display = 'flex';
      this.chatContainer.style.display = 'none';
    } else if (mode === 'chat') {
      this.voiceContainer.style.display = 'none';
      this.chatContainer.style.display = 'flex';
    }
  }

  /**
   * Toggle floating chat widget
   * @param {boolean} isOpen - Is chat open
   */
  async toggleFloatingChat(isOpen) {
    console.log(`💬 Floating chat ${isOpen ? 'opened' : 'closed'}`);
    this.isChatWidgetOpen = isOpen;

    if (isOpen) {
      // Solo mostrar la UI flotante
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
