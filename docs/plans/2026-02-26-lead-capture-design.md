# Lead Capture — Design Document

**Date:** 2026-02-26
**Status:** Approved

---

## Problem

Leads that start a chat but don't complete it are lost. We need to capture contact info (name + email/phone) before the conversation begins so no lead goes untracked.

---

## Approach

New `LeadCapture` component + `LeadStore` service inserted as **step 1** before the existing language selector screen. Follows the existing modular architecture.

---

## New Files

```
public/src/
├── components/
│   └── LeadCapture/
│       ├── LeadCapture.js       ← form UI + returning-user confirmation
│       └── LeadCapture.css      ← styles
└── services/
    └── LeadStore.js             ← localStorage read/write
```

---

## Fields

| Field        | Type   | Required          |
|-------------|--------|-------------------|
| first_name  | text   | At least one of first_name OR last_name |
| last_name   | text   | At least one of first_name OR last_name |
| email       | email  | At least one of email OR phone |
| phone       | tel    | At least one of email OR phone |

**Validation rule:**
```
isValid = (first_name || last_name) && (email || phone)
```

- Inline errors per field group (not blocking alerts)
- "Continue" button disabled until valid

---

## LeadStore Service

```js
LeadStore.save({ first_name, last_name, email, phone })
LeadStore.get()    → { first_name, last_name, email, phone } | null
LeadStore.clear()
```

- localStorage key: `flexspace_lead`
- Mirrors the pattern of `flexspace_utm` in `utm.js`

---

## LeadCapture Component — Two States

### State A — No localStorage data (new user)

```
┌─────────────────────────────────┐
│  👋 Welcome                     │
│  Share your info to get started │
│                                 │
│  [ First Name ]  [ Last Name ]  │
│  [ Email                     ]  │
│  [ Phone                     ]  │
│                                 │
│  ⚠ at least one name +         │
│     email or phone required     │
│                                 │
│       [ Continue →  ]           │
└─────────────────────────────────┘
```

### State B — Data exists in localStorage (returning user)

```
┌─────────────────────────────────┐
│  👋 Welcome back, Juan!         │
│                                 │
│  Are you Juan Pérez?            │
│  juan@email.com · 514-xxx-xxxx  │
│                                 │
│  [ Yes, that's me ]  [ No ]     │
└─────────────────────────────────┘
```

- **"Yes"** → skip form, go directly to language selector (step 2)
- **"No"** → clear localStorage, show State A (empty form)

---

## Updated Flow in ChatWidget

The existing `welcomeScreen` becomes **step 2**. `LeadCapture` is **step 1**.

```
step: 'lead'  →  step: 'lang'  →  step: 'chat'
```

- Transition: `opacity + translateY` (same style as current welcome screen)
- `ChatWidget` manages step state internally
- On "Start new conversation": reset to `step: 'lead'` (checks localStorage again)

---

## Data Flow to Retell AI

Lead data flows through the same path as UTMs:

```
LeadStore.get()
    ↓
ChatOrchestrator.createChat(resetChat, lang, utm, leadData)
    ↓
RetellApiClient.createChat() → POST /api/create-chat
  { reset_chat, lang, utm, leadData }
    ↓
Backend → Retell API
  retell_llm_dynamic_variables: {
    ...utm,
    first_name,
    last_name,
    email,
    phone
  }
```

The agent prompt in Retell can reference `{{first_name}}`, `{{email}}`, etc.

---

## Files to Modify

| File | Change |
|------|--------|
| `ChatWidget.js` | Add step management (lead → lang → chat), mount LeadCapture |
| `ChatOrchestrator.js` | Pass leadData to `createChat()` |
| `RetellApiClient.js` | Accept and forward `leadData` in create-chat body |
| `config.js` | Add i18n strings for lead form (EN + FR) |
| Backend `/api/create-chat` | Include lead fields in `retell_llm_dynamic_variables` |

---

## i18n Strings Needed (EN + FR)

```js
// EN
leadTitle: 'Welcome',
leadSubtitle: 'Share your info to get started',
leadFirstName: 'First Name',
leadLastName: 'Last Name',
leadEmail: 'Email',
leadPhone: 'Phone',
leadContinue: 'Continue',
leadErrorName: 'Please enter at least a first or last name',
leadErrorContact: 'Please enter an email or phone number',
leadReturningTitle: 'Welcome back',
leadReturningQuestion: 'Are you {{name}}?',
leadReturningYes: "Yes, that's me",
leadReturningNo: 'No, use different info',

// FR (same keys, translated)
```

---

## Out of Scope

- Email format validation (basic only)
- Phone format validation (free-form text)
- Sending lead data to n8n webhook on form submit (can be added later)
- GDPR/consent checkbox (can be added later)
