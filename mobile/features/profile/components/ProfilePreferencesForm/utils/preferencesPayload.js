// mobile/features/profile/components/ProfilePreferencesForm/utils/preferencesPayload.js

/**
 * Builds the update payload for preferences.
 * - Converts miles -> km
 * - Ensures backend distance validation (integer >= 1)
 * - Keeps key names aligned with what the caller expects (current onSave contract)
 *
 * If your API expects snake_case keys instead, switch them here (single source of truth).
 */

export function buildPreferencesUpdatePayload(profile, draft) {
  const maxDistanceMiles = typeof draft.maxDistanceMiles === 'number' ? draft.maxDistanceMiles : 5;
  const maxDistanceKm = Math.max(1, Math.round(maxDistanceMiles * 1.60934));

  const minAge = typeof draft.minAgePreference === 'number' ? draft.minAgePreference : 18;
  const maxAge = typeof draft.maxAgePreference === 'number' ? draft.maxAgePreference : 24;

  // Clamp just in case
  const normalizedMinAge = Math.min(minAge, maxAge);
  const normalizedMaxAge = Math.max(minAge, maxAge);

  const VALID_PREFS = ['male', 'female', 'non-binary'];
  const filterValid = (arr) => Array.isArray(arr) ? arr.filter((v) => VALID_PREFS.includes(v)) : [];
  const datingFiltered = filterValid(draft.datingGenderPreference);
  const friendsFiltered = filterValid(draft.friendsGenderPreference);
  const datingPref = datingFiltered.length > 0 ? datingFiltered.slice(0, 3) : null;
  const friendsPref = friendsFiltered.length > 0 ? friendsFiltered.slice(0, 3) : null;

  return {
    isDatingEnabled: !!draft.isDatingEnabled,
    isFriendsEnabled: !!draft.isFriendsEnabled,
    datingGenderPreference: datingPref,
    friendsGenderPreference: friendsPref,
    minAgePreference: normalizedMinAge,
    maxAgePreference: normalizedMaxAge,
    maxDistanceKm,
  };
}
