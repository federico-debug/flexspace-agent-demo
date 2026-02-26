/**
 * LeadCapture Component
 *
 * Overlay screen shown before the language selector.
 * Two states:
 *   - New user:       shows form (first/last name + email/phone)
 *   - Returning user: shows confirmation card from localStorage
 *
 * Calls onComplete(leadData) when ready to proceed.
 */
import { LeadStore } from '../../services/LeadStore.js';

export class LeadCapture {
  /**
   * @param {Object} t - Translation strings (from CONFIG.i18n)
   * @param {Function} onComplete - Called with lead data object when done
   */
  constructor(t, onComplete) {
    this.t = t;
    this.onComplete = onComplete;
    this.element = null;
  }

  /**
   * Create and return the overlay element (starts visible)
   * @returns {HTMLElement}
   */
  create() {
    const screen = document.createElement('div');
    screen.className = 'lead-screen visible';
    this._render(screen);
    this.element = screen;
    return screen;
  }

  /**
   * Re-render content in place (called on language change or new conversation)
   * @param {Object} [t] - Updated translations (optional)
   */
  refresh(t) {
    if (t) this.t = t;
    if (!this.element) return;
    this.element.innerHTML = '';
    this._render(this.element);
  }

  show() {
    this.element?.classList.add('visible');
  }

  hide() {
    this.element?.classList.remove('visible');
  }

  mount(parent) {
    parent.appendChild(this.create());
  }

  // ─────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────

  _render(container) {
    const existing = LeadStore.get();
    container.appendChild(
      existing ? this._buildConfirmation(existing) : this._buildForm()
    );
  }

  _buildConfirmation(data) {
    const { first_name = '', last_name = '', email = '', phone = '' } = data;
    const displayName = [first_name, last_name].filter(Boolean).join(' ');
    const t = this.t;

    const content = document.createElement('div');
    content.className = 'lead-content';
    content.innerHTML = `
      <h3 class="lead-title">${t.leadReturningTitle}, ${this._esc(first_name || displayName)}!</h3>
      <div class="lead-returning-card">
        <p class="lead-returning-name">${this._esc(displayName)}</p>
        ${email ? `<p class="lead-returning-contact">${this._esc(email)}</p>` : ''}
        ${phone ? `<p class="lead-returning-contact">${this._esc(phone)}</p>` : ''}
      </div>
      <div class="lead-returning-actions">
        <button class="lead-confirm-yes">${t.leadReturningYes}</button>
        <button class="lead-confirm-no">${t.leadReturningNo}</button>
      </div>
    `;

    content.querySelector('.lead-confirm-yes').addEventListener('click', () => {
      this.onComplete(data);
    });

    content.querySelector('.lead-confirm-no').addEventListener('click', () => {
      LeadStore.clear();
      // Swap confirmation for the form in place
      const parent = content.parentNode;
      parent.innerHTML = '';
      parent.appendChild(this._buildForm());
    });

    return content;
  }

  _buildForm() {
    const t = this.t;

    const content = document.createElement('div');
    content.className = 'lead-content';
    content.innerHTML = `
      <h3 class="lead-title">${t.leadTitle}</h3>
      <p class="lead-subtitle">${t.leadSubtitle}</p>
      <form class="lead-form" novalidate>
        <div class="lead-name-row">
          <div class="lead-field">
            <input type="text" name="first_name" placeholder="${t.leadFirstName}" autocomplete="given-name" />
          </div>
          <div class="lead-field">
            <input type="text" name="last_name" placeholder="${t.leadLastName}" autocomplete="family-name" />
          </div>
        </div>
        <p class="lead-error lead-error-name" style="display:none">${t.leadErrorName}</p>
        <div class="lead-field">
          <input type="email" name="email" placeholder="${t.leadEmail}" autocomplete="email" />
        </div>
        <div class="lead-field">
          <input type="tel" name="phone" placeholder="${t.leadPhone}" autocomplete="tel" />
        </div>
        <p class="lead-error lead-error-contact" style="display:none">${t.leadErrorContact}</p>
        <button type="submit" class="lead-submit" disabled>${t.leadContinue}</button>
      </form>
    `;

    const form         = content.querySelector('.lead-form');
    const submitBtn    = content.querySelector('.lead-submit');
    const errorName    = content.querySelector('.lead-error-name');
    const errorContact = content.querySelector('.lead-error-contact');

    // Enable/disable button as user types
    form.addEventListener('input', () => {
      submitBtn.disabled = !this._isValid(this._readForm(form));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = this._readForm(form);
      const hasName    = !!(data.first_name || data.last_name);
      const hasContact = !!(data.email || data.phone);

      errorName.style.display    = hasName    ? 'none' : 'block';
      errorContact.style.display = hasContact ? 'none' : 'block';

      if (!hasName || !hasContact) return;

      LeadStore.save(data);
      this.onComplete(data);
    });

    return content;
  }

  _readForm(form) {
    const fd = new FormData(form);
    return {
      first_name: fd.get('first_name')?.trim() || '',
      last_name:  fd.get('last_name')?.trim()  || '',
      email:      fd.get('email')?.trim()      || '',
      phone:      fd.get('phone')?.trim()      || ''
    };
  }

  _isValid(data) {
    return !!(data.first_name || data.last_name) && !!(data.email || data.phone);
  }

  /** Escape user-supplied values inserted via innerHTML */
  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
