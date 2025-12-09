/**
 * CallControls Component
 * Handles call control buttons (Start/End call)
 */
export class CallControls {
  constructor(onStartCall, onEndCall) {
    this.onStartCall = onStartCall;
    this.onEndCall = onEndCall;
    this.element = null;
    this.startButton = null;
    this.endButton = null;
    this.isConnected = false;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'call-controls';

    // Start button
    this.startButton = document.createElement('button');
    this.startButton.id = 'connect-btn';
    this.startButton.className = 'btn-primary';
    this.startButton.textContent = 'Start Voice Call';
    this.startButton.addEventListener('click', () => {
      if (this.onStartCall) {
        this.onStartCall();
      }
    });

    // End button
    this.endButton = document.createElement('button');
    this.endButton.id = 'end-btn';
    this.endButton.className = 'btn-danger hidden';
    this.endButton.textContent = 'End Call';
    this.endButton.addEventListener('click', () => {
      if (this.onEndCall) {
        this.onEndCall();
      }
    });

    container.appendChild(this.startButton);
    container.appendChild(this.endButton);

    this.element = container;
    return container;
  }

  mount(parentElement) {
    if (!this.element) {
      this.render();
    }
    parentElement.appendChild(this.element);
  }

  setConnecting(isConnecting) {
    if (this.startButton) {
      this.startButton.disabled = isConnecting;
      this.startButton.textContent = isConnecting ? 'Connecting...' : 'Start Voice Call';
    }
  }

  setConnected(isConnected) {
    this.isConnected = isConnected;
    if (this.startButton && this.endButton) {
      if (isConnected) {
        this.startButton.classList.add('hidden');
        this.endButton.classList.remove('hidden');
      } else {
        this.startButton.classList.remove('hidden');
        this.endButton.classList.add('hidden');
        this.startButton.disabled = false;
        this.startButton.textContent = 'Start Voice Call';
      }
    }
  }
}
