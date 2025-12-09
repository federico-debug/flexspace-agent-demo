/**
 * StatusBadge Component
 * Displays a live status badge with a pulsing dot
 */
export class StatusBadge {
  constructor(text = 'LIVE: Logistics AI Assistant') {
    this.text = text;
    this.element = null;
  }

  render() {
    const badge = document.createElement('div');
    badge.className = 'badge';

    const pulseDot = document.createElement('div');
    pulseDot.className = 'pulse-dot';

    const textNode = document.createTextNode(this.text);

    badge.appendChild(pulseDot);
    badge.appendChild(textNode);

    this.element = badge;
    return badge;
  }

  mount(parentElement) {
    if (!this.element) {
      this.render();
    }
    parentElement.appendChild(this.element);
  }

  setText(newText) {
    this.text = newText;
    if (this.element) {
      this.element.childNodes[1].textContent = newText;
    }
  }
}
