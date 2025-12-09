/**
 * WidgetSelector Component
 * Tabs to switch between Voice and Chat widgets
 */
export class WidgetSelector {
  /**
   * @param {Function} onModeChange - Callback when mode changes (voice|chat)
   */
  constructor(onModeChange) {
    this.currentMode = 'voice'; // Default to voice
    this.onModeChange = onModeChange;
    this.element = null;
  }

  /**
   * Create the selector element
   * @returns {HTMLElement}
   */
  create() {
    const selector = document.createElement('div');
    selector.className = 'widget-selector';

    const voiceTab = document.createElement('button');
    voiceTab.className = 'widget-tab active';
    voiceTab.textContent = 'Voice Call';
    voiceTab.dataset.mode = 'voice';

    const chatTab = document.createElement('button');
    chatTab.className = 'widget-tab';
    chatTab.textContent = 'Chat';
    chatTab.dataset.mode = 'chat';

    // Event listeners
    voiceTab.addEventListener('click', () => this.switchMode('voice'));
    chatTab.addEventListener('click', () => this.switchMode('chat'));

    selector.appendChild(voiceTab);
    selector.appendChild(chatTab);

    this.element = selector;
    this.tabs = { voice: voiceTab, chat: chatTab };

    return selector;
  }

  /**
   * Switch between voice and chat modes
   * @param {string} mode - 'voice' or 'chat'
   */
  switchMode(mode) {
    if (this.currentMode === mode) return;

    this.currentMode = mode;

    // Update active tab
    Object.keys(this.tabs).forEach(key => {
      if (key === mode) {
        this.tabs[key].classList.add('active');
      } else {
        this.tabs[key].classList.remove('active');
      }
    });

    // Notify parent
    if (this.onModeChange) {
      this.onModeChange(mode);
    }
  }

  /**
   * Get current mode
   * @returns {string}
   */
  getMode() {
    return this.currentMode;
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
}
