/**
 * Configuration Service
 * Chat Agent Configuration
 */
export const CONFIG = {
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
      ]
    },
    fr: {
      welcomeTitle: 'FlexSpace Logistique',
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
      ]
    }
  }
};
