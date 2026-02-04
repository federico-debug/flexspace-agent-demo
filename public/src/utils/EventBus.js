/**
 * EventBus - Generic pub/sub event system
 * Implements Observer pattern for loose coupling between components
 *
 * @example
 * const bus = new EventBus();
 * const handler = (data) => console.log(data);
 * bus.on('message', handler);
 * bus.emit('message', { text: 'Hello' });
 * bus.off('message', handler); // cleanup
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function for convenience
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      // Clean up empty sets
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus: Error in listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Register one-time event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  }

  /**
   * Remove all listeners for an event (or all events if no event specified)
   * @param {string} [event] - Optional event name
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Check if event has listeners
   * @param {string} event - Event name
   * @returns {boolean}
   */
  hasListeners(event) {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size > 0 : false;
  }
}
