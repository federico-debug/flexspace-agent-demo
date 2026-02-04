/**
 * MessageFormatter - Strategy pattern for message formatting
 * Open/Closed Principle: Add new formatters without modifying existing code
 */

/**
 * @interface IFormatter
 * @property {function(string): boolean} canHandle - Check if formatter handles this text
 * @property {function(string, HTMLElement): void} format - Apply formatting to container
 */

/**
 * OutlookFormatter - Creates calendar buttons for Outlook booking URLs
 */
class OutlookFormatter {
  /**
   * @param {string} text
   * @returns {boolean}
   */
  canHandle(text) {
    return text.includes('outlook.office.com/bookwithme');
  }

  /**
   * @param {string} text
   * @returns {string} HTML string
   */
  format(text) {
    const outlookPattern = /(https?:\/\/outlook\.office\.com\/bookwithme\/[^\s<]+)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = outlookPattern.exec(text)) !== null) {
      // Add escaped text before the URL
      if (match.index > lastIndex) {
        parts.push(this.escapeHtml(text.substring(lastIndex, match.index)));
      }

      // Add calendar button HTML
      const embedId = `outlook-embed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      parts.push(
        `<div class="outlook-calendar-button-wrapper" id="${embedId}">` +
        `<a href="${match[0]}" target="_blank" rel="noopener noreferrer" class="outlook-calendar-button">` +
        `📅 Open Calendar</a></div><br>`
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(this.escapeHtml(text.substring(lastIndex)));
    }

    return parts.join('');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * LinkFormatter - Converts URLs to clickable links
 */
class LinkFormatter {
  /**
   * @param {string} text
   * @returns {boolean}
   */
  canHandle(text) {
    return /https?:\/\/|www\./i.test(text);
  }

  /**
   * @param {string} text - Text that may already contain HTML
   * @returns {string}
   */
  format(text) {
    // Split by HTML tags, process only text between tags
    const htmlTagPattern = /(<[^>]+>)/g;
    const parts = text.split(htmlTagPattern);

    return parts.map(part => {
      // If this part is an HTML tag, keep it as is
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      }

      // Process URLs in this text part
      const urlPattern = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
      return part.replace(urlPattern, (url) => {
        // Skip Outlook URLs (already processed)
        if (url.includes('outlook.office.com/bookwithme')) {
          return url;
        }

        const href = url.startsWith('www.') ? `https://${url}` : url;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
      });
    }).join('');
  }
}

/**
 * PlainTextFormatter - Escapes HTML for security (fallback)
 */
class PlainTextFormatter {
  /**
   * @param {string} text
   * @returns {boolean}
   */
  canHandle(text) {
    return true; // Always handles as fallback
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  format(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * MessageFormatter - Orchestrates formatting pipeline
 */
export class MessageFormatter {
  constructor() {
    /**
     * Formatters in order of priority (first match wins for Outlook)
     * @type {Array<{canHandle: Function, format: Function}>}
     */
    this.formatters = [
      new OutlookFormatter(),
      new LinkFormatter()
    ];

    this.plainTextFormatter = new PlainTextFormatter();
  }

  /**
   * Format message text
   * @param {string} text - Raw message text
   * @returns {string} Formatted HTML
   */
  format(text) {
    if (!text) return '';

    let result = text;

    // Check for Outlook embeds first (special handling)
    const outlookFormatter = this.formatters.find(f => f instanceof OutlookFormatter);
    if (outlookFormatter && outlookFormatter.canHandle(text)) {
      result = outlookFormatter.format(text);
    } else {
      // Escape HTML first for plain text
      result = this.plainTextFormatter.format(text);
    }

    // Then process links (works on already-processed text)
    const linkFormatter = this.formatters.find(f => f instanceof LinkFormatter);
    if (linkFormatter && linkFormatter.canHandle(result)) {
      result = linkFormatter.format(result);
    }

    return result;
  }

  /**
   * Add a custom formatter (OCP compliant)
   * @param {Object} formatter - Formatter with canHandle and format methods
   * @param {number} [priority=0] - Position in pipeline (0 = first)
   */
  addFormatter(formatter, priority = 0) {
    if (typeof formatter.canHandle !== 'function' || typeof formatter.format !== 'function') {
      throw new Error('Formatter must have canHandle and format methods');
    }
    this.formatters.splice(priority, 0, formatter);
  }

  /**
   * Escape HTML for XSS protection
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    return this.plainTextFormatter.format(text);
  }
}

// Export individual formatters for testing/extension
export { OutlookFormatter, LinkFormatter, PlainTextFormatter };
