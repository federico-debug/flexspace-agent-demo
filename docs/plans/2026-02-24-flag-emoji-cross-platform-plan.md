# Flag Emoji Cross-Platform Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace country flag emojis (🇬🇧, 🇫🇷) with inline SVGs so the language selector renders correctly on all OS including Windows.

**Architecture:** Two inline SVG strings replace the emoji inside the existing `.lang-flag` spans. The `.lang-flag` CSS rule gets a small tweak to size the SVG correctly instead of relying on emoji font-size.

**Tech Stack:** Vanilla JS (template literal HTML), CSS

---

### Task 1: Replace flag emojis with inline SVGs in ChatWidget.js

**Files:**
- Modify: `public/src/components/ChatWidget/ChatWidget.js:143-148`

**Step 1: Open the file and locate the language selector HTML**

Around line 141-150 in `ChatWidget.js`, find this block:

```js
<div class="welcome-lang-selector">
  <button class="lang-btn selected" data-lang="en">
    <span class="lang-flag">🇬🇧</span>
    <span class="lang-label">English</span>
  </button>
  <button class="lang-btn" data-lang="fr">
    <span class="lang-flag">🇫🇷</span>
    <span class="lang-label">Français</span>
  </button>
</div>
```

**Step 2: Replace with inline SVGs**

Replace the block above with:

```js
<div class="welcome-lang-selector">
  <button class="lang-btn selected" data-lang="en">
    <span class="lang-flag">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="16">
        <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
        <clipPath id="b"><path d="M30 15h30v15zv15H0zH0V0zV0h30z"/></clipPath>
        <g clip-path="url(#a)">
          <path d="M0 0v30h60V0z" fill="#012169"/>
          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/>
          <path d="M0 0l60 30m0-30L0 30" clip-path="url(#b)" stroke="#C8102E" stroke-width="4"/>
          <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>
          <path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/>
        </g>
      </svg>
    </span>
    <span class="lang-label">English</span>
  </button>
  <button class="lang-btn" data-lang="fr">
    <span class="lang-flag">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="24" height="16">
        <rect width="1" height="2" fill="#002395"/>
        <rect x="1" width="1" height="2" fill="#fff"/>
        <rect x="2" width="1" height="2" fill="#ED2939"/>
      </svg>
    </span>
    <span class="lang-label">Français</span>
  </button>
</div>
```

**Step 3: Visual check**

Open `public/index.html` in browser, navigate to Chat tab, verify the welcome screen shows flag icons for both languages.

**Step 4: Commit**

```bash
git add public/src/components/ChatWidget/ChatWidget.js
git commit -m "fix: replace flag emojis with inline SVGs for cross-platform support"
```

---

### Task 2: Fix CSS sizing for SVG flags

**Files:**
- Modify: `public/src/components/ChatWidget/ChatWidget.css:941-944`

**Step 1: Find the current `.lang-flag` rule**

```css
.lang-flag {
  font-size: 20px;
  line-height: 1;
}
```

**Step 2: Update to handle SVG properly**

Replace with:

```css
.lang-flag {
  display: flex;
  align-items: center;
  line-height: 1;
}

.lang-flag svg {
  display: block;
  border-radius: 2px;
}
```

The `width` and `height` are already set directly on the SVG element (24×16px) so no extra CSS sizing is needed. The `border-radius: 2px` gives a slightly polished look matching the rounded rect style of the buttons.

**Step 3: Visual check**

Verify the flags look correctly sized and aligned next to the language labels. Check both selected and unselected states of the buttons.

**Step 4: Commit**

```bash
git add public/src/components/ChatWidget/ChatWidget.css
git commit -m "fix: update .lang-flag CSS for SVG alignment"
```

---

## Done

Both flags now render correctly on Windows, Mac, Linux, iOS, and Android with no external dependencies.
