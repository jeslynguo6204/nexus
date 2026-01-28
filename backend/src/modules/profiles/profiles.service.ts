// src/modules/profiles/profiles.service.ts
import {
  getProfileByUserId,
  getPublicProfileByUserId,
  updateProfileByUserId,
  ProfileRow,
  ProfileUpdateInput as ProfileUpdateDbInput,
} from "./profiles.dao";
import { ProfileUpdateBody } from "./profiles.validation";
import { getPhotosForUser } from "../photos/photos.dao";
import { dbQuery } from "../../db/pool";

export async function getMyProfile(userId: number): Promise<ProfileRow | null> {
  const row = await getProfileByUserId(userId);
  return row ? mapProfileRow(row) : null;
}

export async function getUserProfile(
  currentUserId: number,
  otherUserId: number
): Promise<any | null> {
  const row = await getPublicProfileByUserId(otherUserId, currentUserId);
  if (!row) return null;

  // Fetch photos for the user
  const photos = await getPhotosForUser(otherUserId);

  // Fetch affiliations info
  let affiliationsInfo: any[] = [];
  let dorm: any = null;

  if (Array.isArray(row.affiliations) && row.affiliations.length > 0) {
    const affiliationRows = await dbQuery<{
      id: number;
      name: string;
      short_name: string | null;
      category_id: number;
      category_name: string;
    }>(
      `
      SELECT
        a.id,
        a.name,
        a.short_name,
        a.category_id,
        ac.name AS category_name
      FROM affiliations a
      JOIN affiliation_categories ac ON ac.id = a.category_id
      WHERE a.id = ANY($1::int[])
      `,
      [row.affiliations]
    );

    const dormCategory = await dbQuery<{ id: number }>(
      `SELECT id
       FROM affiliation_categories
       WHERE (LOWER(name) = 'dorm' OR LOWER(name) = 'dorms' OR LOWER(name) LIKE '%dorm%')
         AND LOWER(name) NOT LIKE '%house%'
       LIMIT 1`
    );
    const dormCategoryId = dormCategory[0]?.id;

    affiliationsInfo = affiliationRows.map((affRow) => {
      const isDorm =
        affRow.category_id === dormCategoryId &&
        !affRow.category_name.toLowerCase().includes("house");

      return {
        id: affRow.id,
        name: affRow.name,
        short_name: affRow.short_name,
        category_id: affRow.category_id,
        category_name: affRow.category_name,
        is_dorm: isDorm,
      };
    });

    const dormAffil = affiliationsInfo.find((a) => a.is_dorm);
    if (dormAffil) {
      dorm = dormAffil;
      affiliationsInfo = affiliationsInfo.filter((a) => !a.is_dorm);
    }
  }

  return mapPublicProfileRow({
    ...row,
    photos,
    affiliations_info: affiliationsInfo.length ? affiliationsInfo : null,
    dorm,
  });
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
  if (input.academicYear !== undefined)
    updates.academic_year = input.academicYear;

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

  if (input.locationLat !== undefined)
    updates.location_lat = input.locationLat;
  if (input.locationLon !== undefined)
    updates.location_lon = input.locationLon;
  if (input.locationDescription !== undefined)
    updates.location_description = input.locationDescription;

  if (input.interests !== undefined) updates.interests = input.interests;
  if (input.likes !== undefined) updates.likes = input.likes;
  if (input.dislikes !== undefined) updates.dislikes = input.dislikes;
  if (input.photos !== undefined) updates.photos = input.photos;
  if (input.affiliations !== undefined) updates.affiliations = input.affiliations;

  if (input.gender !== undefined) updates.gender = input.gender;
  if (input.sexuality !== undefined) updates.sexuality = input.sexuality;
  if (input.pronouns !== undefined) updates.pronouns = input.pronouns;
  if (input.religiousBeliefs !== undefined) updates.religious_beliefs = input.religiousBeliefs;
  if (input.height !== undefined) updates.height = input.height;
  if (input.politicalAffiliation !== undefined) updates.political_affiliation = input.politicalAffiliation;
  if (input.languages !== undefined) updates.languages = input.languages;
  if (input.hometown !== undefined) updates.hometown = input.hometown;
  if (input.ethnicity !== undefined) updates.ethnicity = input.ethnicity;
  if (input.featuredAffiliations !== undefined) updates.featured_affiliations = input.featuredAffiliations;

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

// shape public profile row for API consumers
function mapPublicProfileRow(row: any): any {
  return {
    ...row,
    school: {
      id: row.school_id ?? null,
      name: row.school_name ?? null,
      short_name: row.school_short_name ?? null,
    },
  };
}
