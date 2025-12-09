/**
 * Header Component
 * Displays the application logo in the header
 */
export class Header {
  constructor() {
    this.element = null;
  }

  render() {
    const header = document.createElement('header');

    const logo = document.createElement('img');
    logo.src = 'logo.svg';
    logo.alt = 'Logo';
    logo.className = 'header-logo';

    header.appendChild(logo);
    this.element = header;

    return header;
  }

  mount(parentElement) {
    if (!this.element) {
      this.render();
    }
    parentElement.appendChild(this.element);
  }
}
