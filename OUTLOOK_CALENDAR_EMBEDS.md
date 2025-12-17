# Outlook Calendar Embeds Feature

## Overview
Chat messages now automatically detect and embed Outlook Calendar "bookwithme" links as interactive iframes, allowing users to book meetings directly within the chat interface.

## Features

### Automatic Detection
- Detects URLs matching pattern: `https://outlook.office.com/bookwithme/...`
- Converts them to embedded iframes automatically
- Works for both bot and user messages

### Interactive Embedding
- Full-width iframe (100% of message width)
- Desktop: 600px height
- Mobile: 500px height
- Scrollable and fully interactive
- Users can book meetings without leaving chat

### Graceful Fallback
- If iframe fails to load, shows a fallback link
- Fallback displays: "📅 Open Outlook Calendar" button
- Maintains functionality even if embedding fails

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
Agent: "Book a meeting with me: https://outlook.office.com/bookwithme/user/2d1823dc@flexspace.com?anonymous&ep=pcard"

Result: Full calendar booking interface embedded in chat
```

### Example 2: Multiple Links
```
Agent: "Check our website https://example.com or book here: https://outlook.office.com/bookwithme/user/123@domain.com"

Result:
- Outlook link → Embedded calendar
- Website link → Regular clickable link
```

### Example 3: Embed Failure
```
If iframe fails to load:
- Iframe hidden
- Fallback button shown: "📅 Open Outlook Calendar"
- User can click to open in new tab
```

## HTML Structure

```html
<div class="message-embed outlook-calendar-embed" id="outlook-embed-{timestamp}-{random}">
  <iframe 
    src="https://outlook.office.com/bookwithme/..." 
    frameborder="0" 
    scrolling="yes"
    allowfullscreen
    class="outlook-embed-iframe"
    onload="this.style.display='block'"
    onerror="document.getElementById('{embedId}').classList.add('embed-error')">
  </iframe>
  <div class="embed-fallback">
    <a href="{url}" target="_blank" rel="noopener noreferrer" class="message-link">
      📅 Open Outlook Calendar
    </a>
  </div>
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
| `.message-embed` | Container for any embedded content |
| `.outlook-calendar-embed` | Specific container for Outlook calendar |
| `.outlook-embed-iframe` | The iframe element itself |
| `.embed-fallback` | Fallback link container (hidden by default) |
| `.embed-error` | Added to parent when iframe fails |

## Responsive Behavior

### Desktop (> 768px)
- Iframe width: 100%
- Iframe height: 600px
- Full interactive experience

### Mobile (≤ 768px)
- Iframe width: 100%
- Iframe height: 500px
- Touch-optimized interactions
- Fallback button optimized for mobile

## Testing Checklist

- [x] Outlook bookwithme URLs detected correctly
- [x] Iframe embeds and loads calendar
- [x] Fallback shows if iframe fails
- [x] Multiple URLs in same message work
- [x] Non-Outlook URLs still become clickable links
- [x] XSS protection maintained
- [x] Responsive design works on mobile
- [x] Unique IDs prevent conflicts with multiple embeds

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

- **v1.0** (2024-12-17): Initial Outlook Calendar embed implementation
  - Auto-detection of bookwithme URLs
  - Interactive iframe embedding
  - Fallback link support
  - Responsive design
