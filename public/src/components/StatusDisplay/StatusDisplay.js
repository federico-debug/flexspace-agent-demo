/**
 * StatusDisplay Component
 * Displays call status (initial, connected, error states)
 */
export class StatusDisplay {
  constructor() {
    this.element = null;
    this.initialArea = null;
    this.connectedArea = null;
    this.errorArea = null;
    this.timerElement = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'status-display';

    // Initial status area
    this.initialArea = this.createInitialArea();

    // Connected area
    this.connectedArea = this.createConnectedArea();
    this.connectedArea.classList.add('hidden');

    // Error area
    this.errorArea = document.createElement('div');
    this.errorArea.id = 'error-area';
    this.errorArea.className = 'error-box hidden';

    container.appendChild(this.initialArea);
    container.appendChild(this.connectedArea);
    container.appendChild(this.errorArea);

    this.element = container;
    return container;
  }

  createInitialArea() {
    const area = document.createElement('div');
    area.id = 'status-area';

    const title = document.createElement('h2');
    title.innerHTML = `
      Sidetool Logistics
      <br />
      <span class="subtitle">AI Lead Qualification & FAQ Support</span>
    `;

    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = 'Connect with our AI agent for instant logistics quotes, lead qualification, and answers to your shipping questions.';

    area.appendChild(title);
    area.appendChild(description);

    return area;
  }

  createConnectedArea() {
    const area = document.createElement('div');
    area.id = 'connected-area';

    const title = document.createElement('h2');
    title.innerHTML = `
      Connected
      <br />
      <span class="subtitle">Logistics AI Agent</span>
    `;

    const successText = document.createElement('div');
    successText.className = 'success-text';
    successText.textContent = '✅ Voice call active';

    const timer = document.createElement('div');
    timer.className = 'timer';
    this.timerElement = document.createElement('span');
    this.timerElement.id = 'duration';
    this.timerElement.className = 'timer-display';
    this.timerElement.textContent = '00:00';
    timer.appendChild(this.timerElement);

    const hint = document.createElement('p');
    hint.className = 'hint-text';
    hint.textContent = 'Speak naturally - the AI agent will respond in real-time';

    area.appendChild(title);
    area.appendChild(successText);
    area.appendChild(timer);
    area.appendChild(hint);

    return area;
  }

  mount(parentElement) {
    if (!this.element) {
      this.render();
    }
    parentElement.appendChild(this.element);
  }

  showInitial() {
    if (this.initialArea && this.connectedArea) {
      this.initialArea.classList.remove('hidden');
      this.connectedArea.classList.add('hidden');
    }
  }

  showConnected() {
    if (this.initialArea && this.connectedArea) {
      this.initialArea.classList.add('hidden');
      this.connectedArea.classList.remove('hidden');
    }
  }

  showError(message) {
    if (this.errorArea) {
      this.errorArea.textContent = '⚠️ ' + message;
      this.errorArea.classList.remove('hidden');
    }
  }

  hideError() {
    if (this.errorArea) {
      this.errorArea.classList.add('hidden');
    }
  }

  updateTimer(duration) {
    if (this.timerElement) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      this.timerElement.textContent = display;
    }
  }
}
