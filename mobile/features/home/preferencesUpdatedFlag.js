/**
 * Flag set when user saves profile preferences (e.g. discovery prefs).
 * HomeScreen checks this on focus and refreshes the feed only when true.
 */
let preferencesUpdated = false;

export function getPreferencesUpdated() {
  return preferencesUpdated;
}

export function setPreferencesUpdated(value) {
  preferencesUpdated = value;
}
