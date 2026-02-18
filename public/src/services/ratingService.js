/**
 * RatingService - Sends conversation ratings to n8n webhooks
 * Routes to the correct webhook based on language (EN → Lauren, FR → Genevieve)
 */
import { CONFIG } from './config.js';
import { getUtmParams } from '../utils/utm.js';

export class RatingService {
  /**
   * Submit a conversation rating
   * @param {Object} params
   * @param {string} params.rating - 'positive' or 'negative'
   * @param {string} params.comment - Optional comment
   * @param {string} params.lang - Language code ('en' | 'fr')
   * @param {string} params.chatId - Chat session ID
   * @returns {Promise<boolean>} Whether the submission succeeded
   */
  static async submit({ rating, comment = '', lang = 'en', chatId = '' }) {
    const webhookUrl = CONFIG.ratingWebhooks?.[lang] || CONFIG.ratingWebhooks?.en;
    if (!webhookUrl) {
      console.warn('No rating webhook configured for language:', lang);
      return false;
    }

    const payload = {
      rating,
      comment,
      chatId,
      lang,
      utm: getUtmParams(),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to submit rating:', error);
      return false;
    }
  }
}
