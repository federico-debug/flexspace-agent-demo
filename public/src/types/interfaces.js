/**
 * TypeScript-like interfaces using JSDoc
 * These define contracts for Dependency Inversion Principle (DIP)
 *
 * Usage: Import this file for type hints in IDE
 * @example
 * // @ts-check
 * /** @type {import('./types/interfaces.js').IChatService} *\/
 * const chatService = new ChatOrchestrator();
 */

// ============================================
// CORE TYPES
// ============================================

/**
 * @typedef {Object} Message
 * @property {'user'|'agent'} role - Message sender role
 * @property {string} content - Message content
 * @property {number} timestamp - Unix timestamp
 */

/**
 * @typedef {'chatCreated'|'messageSent'|'messageReceived'|'chatEnded'|'error'|'variablesUpdated'|'variableUpdated'|'variablesCleared'} ChatEvent
 */

/**
 * @typedef {Object} ChatEndedPayload
 * @property {string} chatId - The chat ID that ended
 * @property {boolean} [autoEnded] - Whether chat ended automatically
 */

// ============================================
// INTERFACES
// ============================================

/**
 * @interface IChatService
 * Chat service interface for Dependency Inversion
 *
 * @property {function(string, Function): void} on - Register event listener
 * @property {function(boolean=): Promise<string>} createChat - Create new chat session
 * @property {function(string, boolean=): Promise<Object>} sendMessage - Send message
 * @property {function(): Promise<Object>} getChatDetails - Get chat details
 * @property {function(): Promise<boolean>} checkIfChatEnded - Check if chat ended
 * @property {function(): Promise<void>} endChat - End chat session
 * @property {function(): boolean} isActiveChat - Check if chat is active
 * @property {function(): void} reset - Reset service state
 * @property {string|null} chatId - Current chat ID
 * @property {boolean} isActive - Chat active status
 * @property {Message[]} messages - Message history
 * @property {boolean} shouldResetChat - Flag to reset server cache
 */

/**
 * @interface IEventBus
 * Event bus interface for pub/sub
 *
 * @property {function(string, Function): Function} on - Subscribe to event, returns unsubscribe fn
 * @property {function(string, Function): void} off - Unsubscribe from event
 * @property {function(string, *): void} emit - Emit event with data
 * @property {function(string, Function): void} once - Subscribe once
 * @property {function(string=): void} clear - Clear listeners
 */

/**
 * @interface IApiClient
 * API client interface for HTTP communication
 *
 * @property {function(boolean=): Promise<{chat_id: string}>} createChat - Create chat
 * @property {function(string, string): Promise<Object>} sendMessage - Send message
 * @property {function(string): Promise<Object>} getChatDetails - Get chat details
 * @property {function(string): Promise<Object>} endChat - End chat
 */

/**
 * @interface IStateStore
 * State store interface for state management
 *
 * @property {string|null} chatId - Current chat ID
 * @property {Message[]} messages - Message history (copy)
 * @property {boolean} isActive - Active status
 * @property {Object} variables - Extracted variables (copy)
 * @property {function(string): void} initChat - Initialize new chat
 * @property {function(string, string): Message} addMessage - Add message
 * @property {function(): void} setEnded - Mark chat as ended
 * @property {function(): void} reset - Reset all state
 * @property {function(): boolean} isActiveChat - Check active with valid ID
 */

/**
 * @interface IMessageFormatter
 * Message formatter interface for text processing
 *
 * @property {function(string): string} format - Format message text to HTML
 * @property {function(Object, number=): void} addFormatter - Add custom formatter
 * @property {function(string): string} escapeHtml - Escape HTML for XSS protection
 */

/**
 * @interface IFormatter
 * Individual formatter interface (Strategy pattern)
 *
 * @property {function(string): boolean} canHandle - Check if formatter handles text
 * @property {function(string): string} format - Apply formatting
 */

/**
 * @interface IVariableExtractor
 * Variable extractor interface for response parsing
 *
 * @property {function(Object): Object|null} extract - Extract variables from response
 * @property {function(string): boolean} isPriorityVar - Check if priority variable
 * @property {function(Object): string} extractBotResponse - Extract bot message
 * @property {function(Object|string): boolean} isChatEnded - Check if chat ended
 */

// ============================================
// COMPONENT INTERFACES
// ============================================

/**
 * @interface IMessageList
 * Message list component interface
 *
 * @property {function(): HTMLElement} create - Create container element
 * @property {function(string): void} addUserMessage - Add user message
 * @property {function(string): void} addBotMessage - Add bot message
 * @property {function(string): void} showError - Show error message
 * @property {function(Function): HTMLElement} showEndedBanner - Show ended banner
 * @property {function(): void} clear - Clear all messages
 * @property {function(HTMLElement): void} mount - Mount to parent
 */

/**
 * @interface IChatInput
 * Chat input component interface
 *
 * @property {function(): HTMLElement} create - Create input container
 * @property {function(): string} getValue - Get input value
 * @property {function(): void} clear - Clear input
 * @property {function(): void} focus - Focus input
 * @property {function(): void} enable - Enable input
 * @property {function(): void} disable - Disable input
 * @property {function(boolean): void} setProcessing - Set processing state
 * @property {function(HTMLElement): void} mount - Mount to parent
 */

/**
 * @interface ITypingIndicator
 * Typing indicator component interface
 *
 * @property {function(HTMLElement): void} setContainer - Set parent container
 * @property {function(): void} show - Show indicator
 * @property {function(): void} hide - Hide indicator
 * @property {function(): boolean} isVisible - Check visibility
 */

// ============================================
// FACTORY FUNCTIONS (for DI container)
// ============================================

/**
 * Create fully wired ChatWidget with all dependencies
 * @returns {Object} ChatWidget instance
 *
 * @example
 * const widget = createChatWidget();
 * widget.mount(document.body);
 */
export function createChatWidget() {
  // Lazy imports to avoid circular dependencies
  const { EventBus } = await import('../utils/EventBus.js');
  const { RetellApiClient } = await import('../services/RetellApiClient.js');
  const { ChatStateStore } = await import('../services/ChatStateStore.js');
  const { VariableExtractor } = await import('../services/VariableExtractor.js');
  const { ChatOrchestrator } = await import('../services/ChatOrchestrator.js');
  const { ChatWidget } = await import('../components/ChatWidget/ChatWidget.js');

  const eventBus = new EventBus();
  const apiClient = new RetellApiClient();
  const stateStore = new ChatStateStore();
  const extractor = new VariableExtractor();

  const chatService = new ChatOrchestrator(apiClient, stateStore, eventBus, extractor);

  return new ChatWidget(chatService);
}

// Export empty object to make this a module
export default {};
