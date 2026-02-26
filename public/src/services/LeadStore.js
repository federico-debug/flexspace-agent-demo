/**
 * LeadStore — persists lead contact info in localStorage across sessions.
 * Mirrors the pattern of utm.js (sessionStorage) but uses localStorage
 * so data survives browser restarts.
 */

const LEAD_KEY = 'flexspace_lead';

export const LeadStore = {
  /**
   * Save lead data to localStorage
   * @param {{ first_name: string, last_name: string, email: string, phone: string }} data
   */
  save(data) {
    try {
      localStorage.setItem(LEAD_KEY, JSON.stringify(data));
    } catch (e) { /* ignore storage errors (iframe sandbox, etc.) */ }
  },

  /**
   * Read lead data from localStorage
   * @returns {{ first_name: string, last_name: string, email: string, phone: string } | null}
   */
  get() {
    try {
      const raw = localStorage.getItem(LEAD_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) { /* ignore */ }
    return null;
  },

  /**
   * Remove lead data (user clicked "No, use different info")
   */
  clear() {
    try {
      localStorage.removeItem(LEAD_KEY);
    } catch (e) { /* ignore */ }
  }
};
