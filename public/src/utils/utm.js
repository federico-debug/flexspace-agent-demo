/**
 * UTM Utility - Extracts UTM parameters from the current page URL
 * Captures once on load so params are available even after navigation
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

let _cachedUtm = null;

/**
 * Extract UTM parameters from the current URL
 * Results are cached on first call
 * @returns {Object} UTM params (only non-empty values)
 */
export function getUtmParams() {
  if (_cachedUtm) return _cachedUtm;

  const params = new URLSearchParams(window.location.search);
  const utm = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  }

  _cachedUtm = utm;
  return utm;
}

/**
 * Check if any UTM params are present
 * @returns {boolean}
 */
export function hasUtmParams() {
  return Object.keys(getUtmParams()).length > 0;
}
