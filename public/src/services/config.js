/**
 * Configuration Service
 * Centralized configuration for the application
 */
export const CONFIG = {
  publicKey: 'public_key_50bfb86998017c6ce3295',

  // Voice Agent Configuration
  voiceAgentId: 'agent_55e1518cb129b891acf4d2d7b0',
  voiceApiUrl: 'https://api.retellai.com/v2/create-web-call',

  // Chat Agent Configuration
  chatAgentId: 'agent_283b52d2fe12ca91ed9ebb53fa',
  chatApiUrl: 'https://api.retellai.com/v2',
  chatBotName: 'Lauren',
  chatTitle: 'Chat with Lauren AI',
  chatThemeColor: '#000000',
  chatAutoOpen: false,
  chatStarters: [
    'What services do you offer?',
    'How much per pallet?',
    'Where are your warehouses?',
    'Can I tour the facility?',
    'Do you offer delivery?',
    'How fast can I move in?'
  ],

  // Deprecated (for backward compatibility)
  agentId: 'agent_55e1518cb129b891acf4d2d7b0',
  apiUrl: 'https://api.retellai.com/v2/create-web-call'
};
