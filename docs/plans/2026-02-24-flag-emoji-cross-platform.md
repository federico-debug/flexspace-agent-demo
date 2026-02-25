# Design: Cross-Platform Flag Replacement

**Date:** 2026-02-24
**Status:** Approved
**Scope:** Small

## Problem

Country flag emojis (🇬🇧, 🇫🇷) used in the language selector of the chat widget welcome screen are not supported on Windows. Windows does not render regional indicator emoji sequences as flag images — they either show as two-letter codes or boxes.

## Solution

Replace emoji with inline SVG flags. Zero new dependencies, works across all OS and browsers.

## Files to Modify

| File | Change |
|------|--------|
| `public/src/components/ChatWidget/ChatWidget.js` | Replace emoji spans with inline SVG (lines ~143, ~147) |
| `public/src/components/ChatWidget/ChatWidget.css` | Add `width`/`height` to `.lang-flag svg` |

## Design

### HTML (ChatWidget.js)

Replace:
```html
<span class="lang-flag">🇬🇧</span>
<span class="lang-flag">🇫🇷</span>
```

With inline SVG for each flag. France flag is 3 vertical stripes (blue, white, red). UK flag is the Union Jack.

### CSS (ChatWidget.css)

Add explicit dimensions to `.lang-flag svg` so it renders at the same size as the emoji it replaces.

## Trade-offs Considered

| Approach | Decision |
|----------|----------|
| flag-icons CDN | Rejected — external dependency, overkill for 2 flags |
| Inline SVG | **Selected** — zero deps, cross-platform, minimal change |
| PNG images | Rejected — extra files + HTTP requests |

## Success Criteria

- Flags render correctly on Windows, Mac, Linux, iOS, Android
- Visual appearance is equivalent to or better than emoji
- No new dependencies added
