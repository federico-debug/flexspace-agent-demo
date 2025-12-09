/**
 * VoiceWave Component
 * Displays animated concentric circles representing voice waves
 */
export class VoiceWave {
  constructor() {
    this.element = null;
  }

  render() {
    const voiceWave = document.createElement('div');
    voiceWave.className = 'voice-wave';

    // Create 4 concentric circles
    for (let i = 0; i < 4; i++) {
      const span = document.createElement('span');
      voiceWave.appendChild(span);
    }

    this.element = voiceWave;
    return voiceWave;
  }

  mount(parentElement) {
    if (!this.element) {
      this.render();
    }
    parentElement.appendChild(this.element);
  }
}
