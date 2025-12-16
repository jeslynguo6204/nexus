// src/modules/profiles/profiles.service.ts
import {
  getProfileByUserId,
  updateProfileByUserId,
  ProfileRow,
  ProfileUpdateInput as ProfileUpdateDbInput,
} from "./profiles.dao";
import { ProfileUpdateBody } from "./profiles.validation";

export async function getMyProfile(userId: number): Promise<ProfileRow | null> {
  const row = await getProfileByUserId(userId);
  return row ? mapProfileRow(row) : null;
}

export async function updateMyProfile(
  userId: number,
  input: ProfileUpdateBody
): Promise<ProfileRow | null> {
  const updates: ProfileUpdateDbInput = {};

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

  if (input.interests !== undefined) updates.interests = input.interests;
  if (input.photos !== undefined) updates.photos = input.photos;

  // (optional) you can also wire locationDescription to a DB column later

  // additional sanity checks if you want them here
  if (
    updates.min_age_preference != null &&
    updates.max_age_preference != null &&
    updates.min_age_preference > updates.max_age_preference
  ) {
    const err = new Error(
      "minAgePreference cannot be greater than maxAgePreference"
    );
    (err as any).statusCode = 400;
    throw err;
  }

  await updateProfileByUserId(userId, updates);
  const fresh = await getProfileByUserId(userId);
  return fresh ? mapProfileRow(fresh) : null;
}

// shape DB row for API consumers
function mapProfileRow(row: ProfileRow): ProfileRow {
  return {
    ...row,
    school: {
      id: (row as any).school_id ?? null,
      name: (row as any).school_name ?? null,
      short_name: (row as any).school_short_name ?? null,
    },
  } as ProfileRow;
}
