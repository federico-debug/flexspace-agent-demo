/**
 * FloatingChatButton Component
 * Floating button to toggle chat widget
 */
export class FloatingChatButton {
  /**
   * @param {Function} onClick - Callback when button is clicked
   */
  constructor(onClick) {
    this.onClick = onClick;
    this.element = null;
    this.isOpen = false;
  }

  /**
   * Create the floating button element
   * @returns {HTMLElement}
   */
  create() {
    const button = document.createElement('button');
    button.className = 'floating-chat-button';
    button.setAttribute('aria-label', 'Chat with a live agent');

    // Button content with text and icons
    button.innerHTML = `
      <div class="button-content">
        <svg class="bot-icon-small" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8" y2="16"></line>
          <line x1="16" y1="16" x2="16" y2="16"></line>
        </svg>
        <span class="button-text">Get instant answers from a live agent</span>
      </div>
      <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    button.addEventListener('click', () => this.handleClick());

    this.element = button;
    return button;
  }

  /**
   * Handle button click
   */
  handleClick() {
    this.isOpen = !this.isOpen;
    this.updateState();

    if (this.onClick) {
      this.onClick(this.isOpen);
    }
  }

  /**
   * Update button state (open/closed)
   */
  updateState() {
    if (this.element) {
      if (this.isOpen) {
        this.element.classList.add('open');
      } else {
        this.element.classList.remove('open');
      }
    }
  }

  /**
   * Set open state programmatically
   * @param {boolean} open - Open state
   */
  setOpen(open) {
    this.isOpen = open;
    this.updateState();
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
