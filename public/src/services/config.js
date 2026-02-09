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
  chatStarters: [
    'What services do you offer?',
    'How much per pallet?',
    'Where are your warehouses?'
  ]
};
