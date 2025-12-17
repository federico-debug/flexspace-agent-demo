# Outlook Calendar Button Feature

## Overview
Chat messages now automatically detect Outlook Calendar "bookwithme" links and display them as clean, clickable buttons that open the calendar in a new tab.

## Features

### Automatic Detection
- Detects URLs matching pattern: `https://outlook.office.com/bookwithme/...`
- Converts them to styled buttons automatically
- Works for both bot and user messages

### Simple Button Design
- Clean blue button with calendar emoji (📅)
- Text: "Open Calendar"
- Opens calendar in new tab on click
- Microsoft blue color (#0078D4)
- Hover effects with elevation

### Why Not Iframe Embedding?
Outlook Calendar has strict CSP (Content Security Policy) `frame-ancestors` restrictions that only allow embedding on Microsoft-owned domains:
- `teams.cloud.microsoft`
- `outlook.cloud.microsoft`
- `*.office.com`
- `outlook.office365.com`
- `teams.microsoft.com`

Other domains (including localhost, vercel.app, etc.) will be blocked by the browser. Therefore, we use a button that opens the calendar in a new tab instead.

### Link Preservation
- Non-Outlook URLs continue to work as clickable links
- Multiple URLs in same message handled correctly
- Embedded URLs don't appear as duplicate links

## Technical Implementation

### File Changes

#### `ChatWidget.js` - Message Formatting Logic

**New Methods:**

1. **`formatMessage(text)`** - Refactored
   - First processes Outlook embeds
   - Then processes regular links
   - Maintains XSS protection via `escapeHtml()`

2. **`replaceOutlookEmbeds(text)`** - New
   - Detects Outlook bookwithme URLs
   - Replaces with embedded iframe HTML
   ```javascript
   const outlookPattern = /(https?:\/\/outlook\.office\.com\/bookwithme\/[^\s<]+)/gi;
   ```

3. **`createOutlookEmbed(url)`** - New
   - Generates iframe HTML structure
   - Creates unique embed ID
   - Includes error handling and fallback

4. **`replaceRegularLinks(text)`** - New
   - Extracted from original `formatMessage()`
   - Converts non-embedded URLs to clickable links
   - Skips already processed Outlook URLs

#### `ChatWidget.css` - Styling

**New Styles:**

- `.message-embed` - Container for all embeds
- `.outlook-calendar-embed` - Specific to Outlook calendars
- `.outlook-embed-iframe` - Iframe styling
- `.embed-fallback` - Fallback link container (hidden by default)
- Responsive styles for mobile devices

## Usage Examples

### Example 1: Single Outlook Link
```
Agent: "Book a meeting: https://outlook.office.com/bookwithme/user/2d1823dc@flexspace.com?anonymous&ep=pcard"

Result: Blue "📅 Open Calendar" button appears in chat
```

### Example 2: Multiple Links
```
Agent: "Check our website https://example.com or book here: https://outlook.office.com/bookwithme/user/123@domain.com"

Result:
- Outlook link → Blue calendar button
- Website link → Regular clickable link
```

## HTML Structure

```html
<div class="outlook-calendar-button-wrapper" id="outlook-embed-{timestamp}-{random}">
  <a href="https://outlook.office.com/bookwithme/..." 
     target="_blank" 
     rel="noopener noreferrer" 
     class="outlook-calendar-button">
    📅 Open Calendar
  </a>
</div>
```

## Security Considerations

1. **XSS Prevention**
   - All text is escaped via `escapeHtml()` before processing
   - URLs are not executed as scripts
   - Iframe sandbox restrictions apply

2. **External Content**
   - Iframes load from outlook.office.com only
   - Links use `rel="noopener noreferrer"`
   - No JavaScript execution from message content

3. **Error Handling**
   - Iframe errors caught and handled gracefully
   - Fallback link always available
   - No exposed error details to user

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Mobile**: Fully responsive on iOS and Android
- **Iframe Support**: Required for embedding (all modern browsers)

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.outlook-calendar-button-wrapper` | Container for the calendar button |
| `.outlook-calendar-button` | The clickable button itself |

## Responsive Behavior

### Desktop (> 768px)
- Button padding: 12px 24px
- Font size: 15px

### Mobile (≤ 768px)
- Button padding: 10px 20px
- Font size: 14px
- Touch-optimized tap targets

## Testing Checklist

- [x] Outlook bookwithme URLs detected correctly
- [x] Button appears with correct styling
- [x] Button opens calendar in new tab
- [x] Multiple URLs in same message work
- [x] Non-Outlook URLs still become clickable links
- [x] XSS protection maintained on text portions
- [x] HTML structure preserved for buttons
- [x] Responsive design works on mobile
- [x] Hover effects work correctly

## Future Enhancements

Potential improvements for future versions:

1. **Other Services**
   - Google Calendar embeds
   - Microsoft Teams meeting links
   - Zoom meeting embeds

2. **Enhanced UI**
   - Loading spinner while iframe loads
   - Preview thumbnail before full embed
   - Minimize/maximize embed controls

3. **Smart Detection**
   - Auto-detect calendar event links
   - Parse and display event details
   - Reminder/notification integration

4. **Analytics**
   - Track embed load success rate
   - Monitor user interactions with embeds
   - A/B test embed vs link performance

## Related Files

- [`ChatWidget.js`](public/src/components/ChatWidget/ChatWidget.js) - Main logic
- [`ChatWidget.css`](public/src/components/ChatWidget/ChatWidget.css) - Styling
- [`CONVERSATION_END_FEATURES.md`](CONVERSATION_END_FEATURES.md) - Related chat features

## Version History

- **v1.1** (2024-12-17): Fixed HTML rendering and simplified to button
  - Fixed HTML processing order (embeds before escaping)
  - Replaced iframe with simple button due to CSP restrictions
  - Clean Microsoft-branded button design
  - Proper text escaping while preserving HTML structure

- **v1.0** (2024-12-17): Initial implementation attempt
  - Auto-detection of bookwithme URLs
  - Attempted iframe embedding (blocked by CSP)
  - Complex card design (HTML rendering issues)
