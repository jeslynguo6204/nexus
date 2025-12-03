import {
  getProfileByUserId,
  updateProfileByUserId,
  ProfileRow,
  ProfileUpdateInput,
} from "./profiles.dao";

export async function getMyProfile(userId: number): Promise<ProfileRow | null> {
  return getProfileByUserId(userId);
}

export interface ProfileUpdateRequest {
  displayName?: string;
  bio?: string;
  major?: string;
  graduationYear?: number;
  isDatingEnabled?: boolean;
  isFriendsEnabled?: boolean;
  datingGenderPreference?: string;
  friendsGenderPreference?: string;
  minAgePreference?: number;
  maxAgePreference?: number;
  maxDistanceKm?: number;
  showMeInDiscovery?: boolean;
}

export async function updateMyProfile(
  userId: number,
  input: ProfileUpdateRequest
): Promise<ProfileRow | null> {
  const updates: ProfileUpdateInput = {};

  if (input.displayName !== undefined) updates.display_name = input.displayName;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (input.major !== undefined) updates.major = input.major;
  if (input.graduationYear !== undefined)
    updates.graduation_year = input.graduationYear;

  if (input.isDatingEnabled !== undefined)
    updates.is_dating_enabled = input.isDatingEnabled;
  if (input.isFriendsEnabled !== undefined)
    updates.is_friends_enabled = input.isFriendsEnabled;

  if (input.datingGenderPreference !== undefined)
    updates.dating_gender_preference = input.datingGenderPreference;
  if (input.friendsGenderPreference !== undefined)
    updates.friends_gender_preference = input.friendsGenderPreference;

  if (input.minAgePreference !== undefined)
    updates.min_age_preference = input.minAgePreference;
  if (input.maxAgePreference !== undefined)
    updates.max_age_preference = input.maxAgePreference;

  if (input.maxDistanceKm !== undefined)
    updates.max_distance_km = input.maxDistanceKm;

  if (input.showMeInDiscovery !== undefined)
    updates.show_me_in_discovery = input.showMeInDiscovery;

  // simple age range sanity
  if (
    updates.min_age_preference != null &&
    updates.max_age_preference != null &&
    updates.min_age_preference > updates.max_age_preference
  ) {
    const err = new Error("minAgePreference cannot be greater than maxAgePreference");
    (err as any).statusCode = 400;
    throw err;
  }

  // add more constraints later (maxDistanceKm range, allowed gender values, etc.)

  return updateProfileByUserId(userId, updates);
}