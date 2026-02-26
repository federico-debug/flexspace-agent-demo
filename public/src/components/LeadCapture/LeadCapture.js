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
import { CONFIG } from '../../services/config.js';

const COUNTRIES = [
  { code: 'CA', dial: '+1',   name: 'Canada',         digits: [10, 10] },
  { code: 'US', dial: '+1',   name: 'United States',  digits: [10, 10] },
  { code: 'MX', dial: '+52',  name: 'Mexico',         digits: [10, 10] },
  { code: 'GB', dial: '+44',  name: 'United Kingdom', digits: [10, 10] },
  { code: 'FR', dial: '+33',  name: 'France',         digits: [9,  9]  },
  { code: 'ES', dial: '+34',  name: 'Spain',          digits: [9,  9]  },
  { code: 'DE', dial: '+49',  name: 'Germany',        digits: [10, 12] },
  { code: 'IT', dial: '+39',  name: 'Italy',          digits: [9,  10] },
  { code: 'PT', dial: '+351', name: 'Portugal',       digits: [9,  9]  },
  { code: 'BR', dial: '+55',  name: 'Brazil',         digits: [10, 11] },
  { code: 'AR', dial: '+54',  name: 'Argentina',      digits: [10, 10] },
  { code: 'CO', dial: '+57',  name: 'Colombia',       digits: [10, 10] },
  { code: 'CL', dial: '+56',  name: 'Chile',          digits: [9,  9]  },
  { code: 'PE', dial: '+51',  name: 'Peru',           digits: [9,  9]  },
  { code: 'AU', dial: '+61',  name: 'Australia',      digits: [9,  9]  },
  { code: 'NL', dial: '+31',  name: 'Netherlands',    digits: [9,  9]  },
  { code: 'BE', dial: '+32',  name: 'Belgium',        digits: [9,  9]  },
  { code: 'CN', dial: '+86',  name: 'China',          digits: [11, 11] },
  { code: 'JP', dial: '+81',  name: 'Japan',          digits: [10, 11] },
  { code: 'IN', dial: '+91',  name: 'India',          digits: [10, 10] },
  { code: 'KR', dial: '+82',  name: 'South Korea',    digits: [10, 11] },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const content = existing ? this._buildConfirmation(existing) : this._buildForm();

    const logo = document.createElement('img');
    logo.src = `${CONFIG.baseUrl}/agent-avatar.png`;
    logo.alt = 'FlexSpace';
    logo.className = 'lead-logo';
    content.insertBefore(logo, content.firstChild);

    container.appendChild(content);
  }

  _buildConfirmation(data) {
    const { first_name = '', last_name = '', email = '', phone = '' } = data;
    const displayName = [first_name, last_name].filter(Boolean).join(' ');
    const t = this.t;

    const content = document.createElement('div');
    content.className = 'lead-content';
    content.innerHTML = `
      <h3 class="lead-title">${this._esc(t.leadReturningTitle)}, ${this._esc(first_name || displayName)}!</h3>
      <div class="lead-returning-card">
        <p class="lead-returning-name">${this._esc(displayName)}</p>
        ${email ? `<p class="lead-returning-contact">${this._esc(email)}</p>` : ''}
        ${phone ? `<p class="lead-returning-contact">${this._esc(phone)}</p>` : ''}
      </div>
      <div class="lead-returning-actions">
        <button class="lead-confirm-yes">${this._esc(t.leadReturningYes)}</button>
        <button class="lead-confirm-no">${this._esc(t.leadReturningNo)}</button>
      </div>
    `;

    content.querySelector('.lead-confirm-yes').addEventListener('click', () => {
      this.onComplete(data);
    });

    content.querySelector('.lead-confirm-no').addEventListener('click', () => {
      LeadStore.clear();
      this.element.innerHTML = '';
      this._render(this.element);
    });

    return content;
  }

  _buildForm() {
    const t = this.t;
    this._selectedCountry = COUNTRIES[0];

    const content = document.createElement('div');
    content.className = 'lead-content';
    content.innerHTML = `
      <h3 class="lead-title">${this._esc(t.leadTitle)}</h3>
      <p class="lead-subtitle">${this._esc(t.leadSubtitle)}</p>
      <form class="lead-form" novalidate>
        <div class="lead-name-row">
          <div class="lead-field">
            <input type="text" name="first_name" placeholder="${this._esc(t.leadFirstName)}" autocomplete="given-name" />
          </div>
          <div class="lead-field">
            <input type="text" name="last_name" placeholder="${this._esc(t.leadLastName)}" autocomplete="family-name" />
          </div>
        </div>
        <p class="lead-error lead-error-name" style="display:none">${this._esc(t.leadErrorName)}</p>
        <div class="lead-field">
          <input type="email" name="email" placeholder="${this._esc(t.leadEmail)}" autocomplete="email" />
        </div>
        <div class="lead-phone-row">
          <button type="button" class="lead-country-btn" aria-label="Select country code">
            <span class="fi fi-ca lead-country-flag"></span>
            <span class="lead-dial-code">+1</span>
            <span class="lead-caret">▾</span>
          </button>
          <div class="lead-country-dropdown" hidden></div>
          <input type="tel" name="phone_digits" placeholder="${this._esc(t.leadPhone)}" autocomplete="tel-national" inputmode="numeric" />
          <input type="hidden" name="phone_dial" value="+1" />
        </div>
        <p class="lead-error lead-error-contact" style="display:none">${this._esc(t.leadErrorContact)}</p>
        <button type="submit" class="lead-submit" disabled>${this._esc(t.leadContinue)}</button>
      </form>
    `;

    const form         = content.querySelector('.lead-form');
    const submitBtn    = content.querySelector('.lead-submit');
    const errorName    = content.querySelector('.lead-error-name');
    const errorContact = content.querySelector('.lead-error-contact');
    const phoneRow     = content.querySelector('.lead-phone-row');
    const countryBtn   = content.querySelector('.lead-country-btn');
    const dropdown     = content.querySelector('.lead-country-dropdown');
    const flagEl       = countryBtn.querySelector('.lead-country-flag');
    const dialEl       = countryBtn.querySelector('.lead-dial-code');
    const phoneDialInput = content.querySelector('[name="phone_dial"]');

    // Populate country dropdown
    COUNTRIES.forEach(c => {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'lead-country-option';
      opt.innerHTML = `
        <span class="fi fi-${c.code.toLowerCase()} lead-country-flag"></span>
        <span class="lead-country-name">${this._esc(c.name)}</span>
        <span class="lead-dial-code">${this._esc(c.dial)}</span>
      `;
      opt.addEventListener('click', () => {
        this._selectedCountry = c;
        flagEl.className = `fi fi-${c.code.toLowerCase()} lead-country-flag`;
        dialEl.textContent = c.dial;
        phoneDialInput.value = c.dial;
        dropdown.hidden = true;
        submitBtn.disabled = !this._isValid(this._readForm(form));
      });
      dropdown.appendChild(opt);
    });

    // Toggle dropdown on button click
    countryBtn.addEventListener('click', () => {
      dropdown.hidden = !dropdown.hidden;
    });

    // Close dropdown when focus leaves the phone row entirely
    phoneRow.addEventListener('focusout', (e) => {
      if (!e.relatedTarget || !phoneRow.contains(e.relatedTarget)) {
        dropdown.hidden = true;
      }
    });

    // Enable/disable submit + enforce digits-only on phone field
    form.addEventListener('input', (e) => {
      if (e.target.name === 'phone_digits') {
        e.target.value = e.target.value.replace(/\D/g, '');
      }
      submitBtn.disabled = !this._isValid(this._readForm(form));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = this._readForm(form);
      const hasName    = !!(data.first_name || data.last_name);
      const hasContact = !!(data.email || data.phone);
      const emailOk    = !data.email || EMAIL_RE.test(data.email);

      errorName.style.display    = hasName                  ? 'none' : 'block';
      errorContact.style.display = (hasContact && emailOk)  ? 'none' : 'block';

      if (!hasName || !hasContact || !emailOk) return;

      const { phoneDigits, ...saveData } = data;
      LeadStore.save(saveData);
      this.onComplete(saveData);
    });

    return content;
  }

  _readForm(form) {
    const fd     = new FormData(form);
    const dial   = fd.get('phone_dial') || '+1';
    const digits = fd.get('phone_digits')?.trim() || '';
    return {
      first_name:   fd.get('first_name')?.trim() || '',
      last_name:    fd.get('last_name')?.trim()  || '',
      email:        fd.get('email')?.trim()      || '',
      phone:        digits ? (dial + digits) : '',
      phoneDigits:  digits,
    };
  }

  _isValid(data) {
    const hasName    = !!(data.first_name || data.last_name);
    const hasContact = !!(data.email || data.phone);
    const emailOk    = !data.email || EMAIL_RE.test(data.email);
    const phoneOk    = !data.phoneDigits || this._phoneDigitsOk(data.phoneDigits);
    return hasName && hasContact && emailOk && phoneOk;
  }

  _phoneDigitsOk(digits) {
    const [min, max] = (this._selectedCountry || COUNTRIES[0]).digits;
    return digits.length >= min && digits.length <= max;
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
