/**
 * Configuration Service
 * Chat Agent Configuration
 */
export const CONFIG = {
  // Chat Agent Configuration
  // NOTE: chatAgentId moved to backend .env.local for security
  chatApiUrl: 'https://api.retellai.com/v2',
  chatBotName: 'Flexspace',
  chatTitle: 'Chat with Flexspace',
  chatThemeColor: '#000000',
  chatAutoOpen: false,
  // Delay before showing bot response (ms) - simulates natural typing
  responseDelay: 2000,
  chatStarters: [
    'What services do you offer?',
    'How much per pallet?',
    'Where are your warehouses?'
  ]
};
