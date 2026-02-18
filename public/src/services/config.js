/**
 * Configuration Service
 * Chat Agent Configuration
 */

// Auto-detect base URL for assets and API calls.
// When loaded via embed.js cross-origin, paths must be absolute to the Vercel host.
// When loaded directly (index.html), paths can be relative (empty base).
function detectBaseUrl() {
  // Check if app.js was loaded from a different origin (embed scenario)
  try {
    const appScript = document.querySelector('script[src*="/src/app.js"]');
    if (appScript && appScript.src) {
      const url = new URL(appScript.src);
      const origin = url.origin;
      // If the script origin differs from the page origin, we're embedded
      if (origin !== window.location.origin) {
        return origin;
      }
    }
  } catch (e) { /* ignore */ }
  return ''; // Same-origin, use relative paths
}

const BASE_URL = detectBaseUrl();

export const CONFIG = {
  baseUrl: BASE_URL,
  // Chat Agent Configuration
  // NOTE: chatAgentId moved to backend .env.local for security
  chatApiUrl: 'https://api.retellai.com/v2',
  chatBotName: 'FlexSpace',
  chatTitle: 'Chat with FlexSpace',
  chatThemeColor: '#da4e29',
  chatAutoOpen: false,
  // Delay before showing bot response (ms) - simulates natural typing
  responseDelay: 2000,
  // Default language
  defaultLang: 'en',
  // Legacy starters (kept for backward compatibility)
  chatStarters: [
    'What services do you offer?',
    'How much per pallet?',
    'Where are your warehouses?'
  ],
  // Translations per language
  i18n: {
    en: {
      welcomeTitle: 'FlexSpace Logistics',
      welcomeSubtitle: 'To chat with us, click below',
      welcomeButton: 'Connect with an Agent',
      chatTitle: 'Chat with FlexSpace',
      inputPlaceholder: 'Type your message...',
      online: 'Online',
      offline: 'Offline',
      newConversation: 'New conversation',
      selectOption: 'Select an option',
      initialGreeting: 'Hello',
      conversationEnded: 'Conversation Ended',
      conversationCompletedSubtitle: 'This conversation has been completed',
      startNewConversation: 'Start New Conversation',
      inputEndedPlaceholder: 'Conversation ended',
      chatStarters: [
        'What services do you offer?',
        'How much per pallet?',
        'Where are your warehouses?'
      ],
      rateTitle: 'How was your experience?',
      rateThankYou: 'Thanks for your feedback!',
      rateCommentPlaceholder: 'Any additional comments? (optional)',
      rateSend: 'Send'
    },
    fr: {
      welcomeTitle: 'FlexSpace Logistics',
      welcomeSubtitle: 'Pour discuter avec nous, cliquez ci-dessous',
      welcomeButton: 'Parler avec un agent',
      chatTitle: 'Discuter avec FlexSpace',
      inputPlaceholder: 'Tapez votre message...',
      online: 'En ligne',
      offline: 'Hors ligne',
      newConversation: 'Nouvelle conversation',
      selectOption: 'Choisir une option',
      initialGreeting: 'Bonjour',
      conversationEnded: 'Conversation terminée',
      conversationCompletedSubtitle: 'Cette conversation est terminée',
      startNewConversation: 'Nouvelle conversation',
      inputEndedPlaceholder: 'Conversation terminée',
      chatStarters: [
        'Quels services proposez-vous ?',
        'Combien par palette ?',
        'Où sont vos entrepôts ?'
      ],
      rateTitle: 'Comment était votre expérience ?',
      rateThankYou: 'Merci pour votre retour !',
      rateCommentPlaceholder: 'Des commentaires supplémentaires ? (optionnel)',
      rateSend: 'Envoyer'
    }
  },
  // Rating webhook URLs per language
  ratingWebhooks: {
    en: 'https://flexspacelogistics.app.n8n.cloud/webhook/laurenchatbotrating',
    fr: 'https://flexspacelogistics.app.n8n.cloud/webhook/genevievechatbotrating'
  },
  // Chat started tracking webhook (single endpoint, lang included in payload)
  chatStartedWebhook: 'https://flexspacelogistics.app.n8n.cloud/webhook/flexspacechatbotstarted'
};
