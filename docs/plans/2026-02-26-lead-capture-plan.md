# Lead Capture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Capture name + email/phone before chat starts, persist to localStorage, and forward as variables to Retell AI.

**Architecture:** New `LeadCapture` component + `LeadStore` service inserted as step 1 before the existing language selector. `ChatOrchestrator.createChat()` reads from `LeadStore` directly (same pattern as `getUtmParams()`) and forwards lead data to the backend, which injects it into `retell_llm_dynamic_variables`.

**Tech Stack:** Vanilla JS ES modules, localStorage, existing Vercel serverless backend, Retell AI SDK.

---

## File Map

| Action | Path |
|--------|------|
| CREATE | `public/src/services/LeadStore.js` |
| CREATE | `public/src/components/LeadCapture/LeadCapture.js` |
| CREATE | `public/src/components/LeadCapture/LeadCapture.css` |
| MODIFY | `public/src/services/config.js` |
| MODIFY | `public/src/components/ChatWidget/ChatWidget.js` |
| MODIFY | `public/src/services/ChatOrchestrator.js` |
| MODIFY | `public/src/services/RetellApiClient.js` |
| MODIFY | `api/create-chat.js` |
| MODIFY | `public/src/services/trackingService.js` |

---

## Task 1: Create `LeadStore` service

**Files:**
- Create: `public/src/services/LeadStore.js`

**Step 1: Create the file**

```js
/**
 * LeadStore — persists lead contact info in localStorage across sessions.
 * Mirrors the pattern of utm.js (sessionStorage) but uses localStorage
 * so data survives browser restarts.
 */

const LEAD_KEY = 'flexspace_lead';

export const LeadStore = {
  /**
   * Save lead data to localStorage
   * @param {{ first_name: string, last_name: string, email: string, phone: string }} data
   */
  save(data) {
    try {
      localStorage.setItem(LEAD_KEY, JSON.stringify(data));
    } catch (e) { /* ignore storage errors (iframe sandbox, etc.) */ }
  },

  /**
   * Read lead data from localStorage
   * @returns {{ first_name: string, last_name: string, email: string, phone: string } | null}
   */
  get() {
    try {
      const raw = localStorage.getItem(LEAD_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) { /* ignore */ }
    return null;
  },

  /**
   * Remove lead data (user clicked "No, use different info")
   */
  clear() {
    try {
      localStorage.removeItem(LEAD_KEY);
    } catch (e) { /* ignore */ }
  }
};
```

**Step 2: Manual verify in browser console**

Open the app in the browser, open DevTools console, paste:
```js
import('./src/services/LeadStore.js').then(m => {
  m.LeadStore.save({ first_name: 'Test', last_name: '', email: 'test@test.com', phone: '' });
  console.log(m.LeadStore.get()); // → { first_name: 'Test', ... }
  m.LeadStore.clear();
  console.log(m.LeadStore.get()); // → null
});
```

**Step 3: Commit**
```bash
git add public/src/services/LeadStore.js
git commit -m "feat: add LeadStore service for localStorage lead persistence"
```

---

## Task 2: Add i18n strings to `config.js`

**Files:**
- Modify: `public/src/services/config.js`

**Step 1: Add to `i18n.en` block** (after the `rateSend` key):

```js
// Lead capture
leadTitle: 'Get started',
leadSubtitle: 'Enter your info to connect with an agent',
leadFirstName: 'First Name',
leadLastName: 'Last Name',
leadEmail: 'Email',
leadPhone: 'Phone',
leadContinue: 'Continue',
leadErrorName: 'Please enter your first or last name',
leadErrorContact: 'Please enter your email or phone number',
leadReturningTitle: 'Welcome back',
leadReturningYes: "Yes, that's me",
leadReturningNo: 'Use different info',
```

**Step 2: Add to `i18n.fr` block** (after the `rateSend` key):

```js
// Lead capture
leadTitle: 'Commencer',
leadSubtitle: 'Entrez vos informations pour parler avec un agent',
leadFirstName: 'Prénom',
leadLastName: 'Nom',
leadEmail: 'Courriel',
leadPhone: 'Téléphone',
leadContinue: 'Continuer',
leadErrorName: 'Veuillez entrer votre prénom ou nom',
leadErrorContact: 'Veuillez entrer votre courriel ou numéro de téléphone',
leadReturningTitle: 'Bon retour',
leadReturningYes: "Oui, c'est moi",
leadReturningNo: 'Utiliser d\'autres informations',
```

**Step 3: Commit**
```bash
git add public/src/services/config.js
git commit -m "feat: add lead capture i18n strings (EN + FR)"
```

---

## Task 3: Create `LeadCapture.css`

**Files:**
- Create: `public/src/components/LeadCapture/LeadCapture.css`

**Step 1: Create the file**

```css
/* Lead Capture Screen — overlays the full widget, z-index above welcome screen */
.lead-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 51; /* above .chat-welcome-screen (z-index: 50) */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  border-radius: 24px;
  overflow-y: auto;
}

.floating .lead-screen {
  border-radius: 0;
}

/* When the lead screen is visible in floating mode, hide underlying content */
.floating .chat-widget:has(.lead-screen.visible) > :not(.lead-screen):not(.chat-welcome-screen) {
  visibility: hidden;
}

.lead-screen.visible {
  opacity: 1;
  visibility: visible;
}

/* Content container */
.lead-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 32px 28px;
  width: 100%;
  max-width: 400px;
  animation: leadFadeUp 0.4s ease-out 0.05s both;
}

@keyframes leadFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.lead-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1d2a67;
}

.lead-subtitle {
  margin: 0;
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

/* Form */
.lead-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  text-align: left;
}

/* Two inputs side by side */
.lead-name-row {
  display: flex;
  gap: 10px;
}

.lead-name-row .lead-field {
  flex: 1;
}

/* Input wrapper */
.lead-field {
  display: flex;
  flex-direction: column;
}

.lead-field input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #1f2937;
  background: #f9fafb;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
  outline: none;
}

.lead-field input::placeholder {
  color: #9ca3af;
}

.lead-field input:focus {
  border-color: #da4e29;
  background: #ffffff;
}

/* Error messages */
.lead-error {
  font-size: 12px;
  color: #ef4444;
  margin: -4px 0 0 2px;
  text-align: left;
}

/* Submit button — same style as .welcome-start-btn */
.lead-submit {
  margin-top: 6px;
  padding: 14px 48px;
  background: #da4e29;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  align-self: center;
}

.lead-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.lead-submit:not(:disabled):hover {
  background: #b8401f;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(218, 78, 41, 0.3);
}

.lead-submit:not(:disabled):active {
  transform: translateY(0);
}

/* ── Returning user confirmation ── */
.lead-returning-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%;
  text-align: left;
}

.lead-returning-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.lead-returning-contact {
  margin: 2px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.lead-returning-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

/* Primary confirm button */
.lead-confirm-yes {
  flex: 1;
  padding: 12px;
  background: #da4e29;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.lead-confirm-yes:hover {
  background: #b8401f;
}

/* Secondary ghost button */
.lead-confirm-no {
  flex: 1;
  padding: 12px;
  background: #ffffff;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.lead-confirm-no:hover {
  border-color: #da4e29;
  color: #da4e29;
}
```

**Step 2: Commit**
```bash
git add public/src/components/LeadCapture/LeadCapture.css
git commit -m "feat: add LeadCapture CSS styles"
```

---

## Task 4: Create `LeadCapture.js` component

**Files:**
- Create: `public/src/components/LeadCapture/LeadCapture.js`

**Step 1: Create the file**

```js
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

    const form        = content.querySelector('.lead-form');
    const submitBtn   = content.querySelector('.lead-submit');
    const errorName   = content.querySelector('.lead-error-name');
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
```

**Step 2: Commit**
```bash
git add public/src/components/LeadCapture/
git commit -m "feat: add LeadCapture component (form + returning-user confirmation)"
```

---

## Task 5: Integrate `LeadCapture` into `ChatWidget.js`

**Files:**
- Modify: `public/src/components/ChatWidget/ChatWidget.js`

This is the most surgical task. Make each change carefully.

### Step 1: Add import at the top (after existing imports)

```js
import { LeadCapture } from '../LeadCapture/LeadCapture.js';
```

### Step 2: Add `leadCapture` property to constructor (after `this.historyPanel = null;`)

```js
this.leadCapture = null;
```

### Step 3: In `create()` — change welcome screen to start hidden

Find this line (~line 132):
```js
this.welcomeScreen.className = 'chat-welcome-screen visible';
```
Change to:
```js
this.welcomeScreen.className = 'chat-welcome-screen';
```

### Step 4: In `create()` — create and mount LeadCapture (before the final `this.element = widget;` line)

Add after `this.historyPanel.mount(widget);`:
```js
// Lead capture screen (step 1 — before language selector)
const defaultT = this.getTranslations();
this.leadCapture = new LeadCapture(defaultT, () => this._showLangScreen());
this.leadCapture.mount(widget);
```

### Step 5: Replace `showWelcomeScreen()` method

Find the entire `showWelcomeScreen()` method and replace it:

```js
/**
 * Show lead capture screen (step 1 of pre-chat flow).
 * If localStorage has lead data, shows confirmation; otherwise shows form.
 * Called when widget opens or user starts new conversation.
 */
showWelcomeScreen() {
  if (this.chatService.isActiveChat() || this.isProcessing) return;
  const t = this.getTranslations();
  this.leadCapture?.refresh(t);
  this.leadCapture?.show();
  // Ensure lang screen is hidden behind it
  this.welcomeScreen?.classList.remove('visible');
}
```

### Step 6: Add private `_showLangScreen()` method (after `showWelcomeScreen`)

```js
/**
 * Show language selector screen (step 2 of pre-chat flow).
 * Called after lead capture completes.
 */
_showLangScreen() {
  this.leadCapture?.hide();
  if (this.welcomeScreen) {
    this.welcomeScreen.classList.add('visible');
  }
}
```

### Step 7: Update `hideWelcomeScreen()` to also hide lead screen

Find `hideWelcomeScreen()` and update it:
```js
hideWelcomeScreen() {
  this.leadCapture?.hide();
  if (this.welcomeScreen) {
    this.welcomeScreen.classList.remove('visible');
  }
}
```

### Step 8: Add CSS import to `index.html`

In `public/index.html`, find where the other component CSS files are linked and add:
```html
<link rel="stylesheet" href="/src/components/LeadCapture/LeadCapture.css">
```

### Step 9: Manual smoke test

Open the app. You should see:
- **New user**: Lead form with 4 inputs, Continue disabled until valid
- Fill first name + email → Continue enables → click → lang screen appears → Connect → chat works
- **Returning user**: Open DevTools → Application → localStorage → check `flexspace_lead` key was written
- Refresh page → lead screen shows confirmation with name → "Yes" → lang screen → Connect → chat works
- Click "No" → form appears empty

**Step 10: Commit**
```bash
git add public/src/components/ChatWidget/ChatWidget.js public/index.html
git commit -m "feat: integrate LeadCapture into ChatWidget pre-chat flow"
```

---

## Task 6: Pass lead data through `ChatOrchestrator` → `RetellApiClient`

### Part A — `ChatOrchestrator.js`

**Files:**
- Modify: `public/src/services/ChatOrchestrator.js`

**Step 1: Add import** (after `import { getUtmParams } from '../utils/utm.js';`):
```js
import { LeadStore } from './LeadStore.js';
```

**Step 2: Modify `createChat()` method** — add `leadData` alongside `utm`:

Find:
```js
const utm = getUtmParams();
const data = await this.apiClient.createChat(resetChat, this.selectedLang, utm);
```
Replace with:
```js
const utm = getUtmParams();
const leadData = LeadStore.get() || {};
const data = await this.apiClient.createChat(resetChat, this.selectedLang, utm, leadData);
```

### Part B — `RetellApiClient.js`

**Files:**
- Modify: `public/src/services/RetellApiClient.js`

**Step 1: Update `createChat()` signature and body**:

Find:
```js
async createChat(resetChat = false, lang = 'en', utm = {}) {
  const response = await fetch(`${CONFIG.baseUrl}/api/create-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset_chat: resetChat, lang, utm })
  });
```
Replace with:
```js
async createChat(resetChat = false, lang = 'en', utm = {}, leadData = {}) {
  const response = await fetch(`${CONFIG.baseUrl}/api/create-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset_chat: resetChat, lang, utm, leadData })
  });
```

**Step 2: Commit**
```bash
git add public/src/services/ChatOrchestrator.js public/src/services/RetellApiClient.js
git commit -m "feat: pass lead data from ChatOrchestrator through to create-chat API"
```

---

## Task 7: Update backend `api/create-chat.js`

**Files:**
- Modify: `api/create-chat.js`

**Step 1: Extract `leadData` from request body and add to `retell_llm_dynamic_variables`**

Find:
```js
const lang = req.body?.lang || 'en';
const utm = req.body?.utm || {};
const agent_id = AGENT_MAP[lang] || RETELL_AGENT_ID;
```
Replace with:
```js
const lang = req.body?.lang || 'en';
const utm = req.body?.utm || {};
const leadData = req.body?.leadData || {};
const agent_id = AGENT_MAP[lang] || RETELL_AGENT_ID;
```

Find:
```js
retell_llm_dynamic_variables: {
  utm_source: utm.utm_source || 'direct',
  utm_medium: utm.utm_medium || null,
  utm_campaign: utm.utm_campaign || null,
  utm_content: utm.utm_content || null,
  utm_term: utm.utm_term || null,
},
```
Replace with:
```js
retell_llm_dynamic_variables: {
  utm_source: utm.utm_source || 'direct',
  utm_medium: utm.utm_medium || null,
  utm_campaign: utm.utm_campaign || null,
  utm_content: utm.utm_content || null,
  utm_term: utm.utm_term || null,
  first_name: leadData.first_name || null,
  last_name: leadData.last_name || null,
  email: leadData.email || null,
  phone: leadData.phone || null,
},
```

**Step 2: Verify in Vercel logs**

After deploying, start a chat and check Vercel function logs. You should see the `chatResponse` object containing `retell_llm_dynamic_variables` with the lead fields.

**Step 3: Commit**
```bash
git add api/create-chat.js
git commit -m "feat: forward lead data as retell_llm_dynamic_variables in create-chat"
```

---

## Task 8: Add lead data to `TrackingService` webhook

**Files:**
- Modify: `public/src/services/trackingService.js`

**Step 1: Add import** (after existing imports):
```js
import { LeadStore } from './LeadStore.js';
```

**Step 2: Add lead to webhook payload**

Find:
```js
const payload = {
  event: 'chat_started',
  chatId,
  lang,
  utm: getUtmParams(),
  pageUrl: window.location.href,
  referrer: document.referrer || '',
  timestamp: new Date().toISOString()
};
```
Replace with:
```js
const payload = {
  event: 'chat_started',
  chatId,
  lang,
  lead: LeadStore.get() || {},
  utm: getUtmParams(),
  pageUrl: window.location.href,
  referrer: document.referrer || '',
  timestamp: new Date().toISOString()
};
```

**Step 3: Commit**
```bash
git add public/src/services/trackingService.js
git commit -m "feat: include lead data in chat-started tracking webhook"
```

---

## Task 9: End-to-end manual test

Open the app (local dev server or deployed). Work through each scenario:

**Scenario A — New user, form validation**
1. Open chat widget → see lead form with 4 inputs
2. Click "Continue" with empty form → button stays disabled ✓
3. Fill only first name → button still disabled ✓
4. Fill first name + email → button enables ✓
5. Click Continue → lead screen fades, lang screen appears ✓
6. Open DevTools → Application → Local Storage → `flexspace_lead` key exists with correct values ✓
7. Select language → click Connect → chat starts
8. Open DevTools → Network → find `create-chat` POST request → check request body has `leadData: { first_name, email }` ✓

**Scenario B — New user with last name + phone only**
1. Clear localStorage (`flexspace_lead`) from DevTools
2. Fill only last name + phone → Continue enables → click → proceeds ✓
3. Verify `flexspace_lead` saved with `last_name` and `phone` fields ✓

**Scenario C — Returning user (Yes)**
1. Refresh page → lead screen shows confirmation with stored name + contact ✓
2. Click "Yes, that's me" → lang screen appears ✓
3. Connect → chat starts with personalized variables (check Retell agent receives `first_name` etc.) ✓

**Scenario D — Returning user (No)**
1. Refresh page → confirmation card appears
2. Click "No, use different info" → form appears empty ✓
3. localStorage `flexspace_lead` is cleared ✓
4. Fill new data → Continue → lang screen ✓
5. New data is saved in localStorage ✓

**Scenario E — Start new conversation**
1. Complete a chat → click "Start New Conversation"
2. Lead screen appears (with confirmation if localStorage has data) ✓
3. Flow completes normally ✓

**Scenario F — Language switch (FR)**
1. Clear localStorage
2. Complete lead form in EN → lang screen appears
3. Switch to FR → labels in lang screen update ✓
4. Note: lead form was already completed in EN before language switch — this is expected behavior

---

## Task 10: Final commit

```bash
git add -A
git status  # verify no unexpected files
git commit -m "feat: complete lead capture implementation with LocalStorage persistence and Retell variable injection"
```

---

## Notes for Retell AI Agent Setup

For the lead data to be useful in the Retell agent, the agent's prompt must reference the variables. Example additions to the agent system prompt:

```
The user's name is {{first_name}} {{last_name}}.
Their contact info: email = {{email}}, phone = {{phone}}.
Greet them by first name if available.
```

If a variable is null (e.g. no phone provided), Retell will render it as empty string — the agent should be prompted to handle this gracefully.
