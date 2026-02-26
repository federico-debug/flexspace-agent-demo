/**
 * TrackingService - Sends chat started events with UTM data to n8n webhook
 */
import { CONFIG } from './config.js';
import { getUtmParams } from '../utils/utm.js';
import { LeadStore } from './LeadStore.js';

export class TrackingService {
  /**
   * Notify webhook that a chat session started
   * @param {Object} params
   * @param {string} params.chatId - Chat session ID
   * @param {string} params.lang - Language code ('en' | 'fr')
   */
  static async chatStarted({ chatId, lang }) {
    const webhookUrl = CONFIG.chatStartedWebhook;
    if (!webhookUrl) return;

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

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send chat started tracking:', error);
    }
  }
}
