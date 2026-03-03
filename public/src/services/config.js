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
      rateSend: 'Send',
      // Booking reminder (shown once when user clicks the calendar button)
      bookingReminderBoth: "Once you've completed your booking, please check your email and accept the meeting invite — otherwise we'll reach out at the phone number you provided. Looking forward to connecting! 📅",
      bookingReminderEmailOnly: "Once you've completed your booking, please check your email and accept the meeting invite. Looking forward to connecting! 📅",
      bookingReminderPhoneOnly: "Once you've completed your booking, we'll reach out at the phone number you provided to confirm the details. Looking forward to connecting! 📅",
      bookingReminderGeneric: "Once you've completed your booking, we'll be in touch to confirm. Looking forward to connecting! 📅",
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
      leadReturningNo: 'Use different info'
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
      rateSend: 'Envoyer',
      // Booking reminder (shown once when user clicks the calendar button)
      bookingReminderBoth: "Une fois votre rendez-vous pris, veuillez vérifier votre courriel et accepter l'invitation — sinon nous vous contacterons au numéro fourni. Au plaisir de vous parler ! 📅",
      bookingReminderEmailOnly: "Une fois votre rendez-vous pris, veuillez vérifier votre courriel et accepter l'invitation. Au plaisir de vous parler ! 📅",
      bookingReminderPhoneOnly: "Une fois votre rendez-vous pris, nous vous contacterons au numéro fourni pour confirmer les détails. Au plaisir de vous parler ! 📅",
      bookingReminderGeneric: "Une fois votre rendez-vous pris, nous vous contacterons pour confirmer. Au plaisir de vous parler ! 📅",
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
      leadReturningNo: "Utiliser d'autres informations"
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
