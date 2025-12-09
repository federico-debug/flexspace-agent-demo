/**
 * RetellClient Service
 * Manages Retell AI Web Client integration
 */
import { RetellWebClient } from 'retell-client-js-sdk';
import { CONFIG } from './config.js';

export class RetellClientService {
  constructor() {
    this.client = null;
    this.callbacks = {
      onCallStarted: null,
      onCallEnded: null,
      onError: null,
      onAgentStartTalking: null,
      onAgentStopTalking: null,
      onUpdate: null
    };
  }

  /**
   * Initialize the Retell Web Client
   */
  initialize() {
    if (!this.client) {
      this.client = new RetellWebClient();
      this.setupEventListeners();
    }
  }

  /**
   * Setup event listeners for the Retell client
   */
  setupEventListeners() {
    if (!this.client) return;

    this.client.on('call_started', () => {
      console.log('✅ Call started');
      if (this.callbacks.onCallStarted) {
        this.callbacks.onCallStarted();
      }
    });

    this.client.on('call_ended', () => {
      console.log('📞 Call ended');
      if (this.callbacks.onCallEnded) {
        this.callbacks.onCallEnded();
      }
    });

    this.client.on('error', (error) => {
      console.error('❌ Call error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    this.client.on('agent_start_talking', () => {
      console.log('🎙️ Agent started talking');
      if (this.callbacks.onAgentStartTalking) {
        this.callbacks.onAgentStartTalking();
      }
    });

    this.client.on('agent_stop_talking', () => {
      console.log('🔇 Agent stopped talking');
      if (this.callbacks.onAgentStopTalking) {
        this.callbacks.onAgentStopTalking();
      }
    });

    this.client.on('update', (update) => {
      console.log('Update:', update);
      if (this.callbacks.onUpdate) {
        this.callbacks.onUpdate(update);
      }
    });
  }

  /**
   * Register callbacks
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  /**
   * Create a web call and start it
   */
  async startCall() {
    try {
      this.initialize();

      console.log('🚀 Creating web call...');

      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.publicKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_id: CONFIG.agentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Web call created:', data.call_id);

      await this.client.startCall({
        accessToken: data.access_token
      });

      console.log('📞 Call started with access token');
      return true;
    } catch (error) {
      console.error('❌ Error starting call:', error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  stopCall() {
    console.log('🔚 Ending call...');
    if (this.client) {
      this.client.stopCall();
    }
  }
}
