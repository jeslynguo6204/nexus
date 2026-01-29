// mobile/features/profile/components/ProfilePreferencesForm/utils/preferencesDraft.js

/**
 * Normalized draft model for the preferences editor.
 * Keeps UI state in one object (like ProfileDetailsForm draft).
 */

export function preferencesFromProfile(profile) {
  const p = profile || {};

  const isDatingEnabled = p.is_dating_enabled ?? false;
  const isFriendsEnabled = p.is_friends_enabled ?? false;

  const datingGenderPreference = p.dating_gender_preference || 'everyone';
  const friendsGenderPreference = p.friends_gender_preference || 'everyone';

  const minAgePreference = typeof p.min_age_preference === 'number' ? p.min_age_preference : 18;
  const maxAgePreference = typeof p.max_age_preference === 'number' ? p.max_age_preference : 24;

  const maxDistanceMiles = p.max_distance_km
    ? Math.round(p.max_distance_km / 1.60934)
    : 5;

  return {
    isDatingEnabled,
    isFriendsEnabled,
    datingGenderPreference,
    friendsGenderPreference,
    minAgePreference,
    maxAgePreference,
    maxDistanceMiles,
  };
}
