import { dbQuery } from "../../db/pool";

export interface ProfileRow {
  user_id: number;
  display_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
  school_id?: number | null;
  school_name?: string | null;
  school_short_name?: string | null;
  school?: {
    id: number | null;
    name: string | null;
    short_name: string | null;
  };
  is_dating_enabled: boolean;
  is_friends_enabled: boolean;
  dating_gender_preference: string | null;
  friends_gender_preference: string | null;
  min_age_preference: number | null;
  max_age_preference: number | null;
  max_distance_km: number | null;
  show_me_in_discovery: boolean;
  location_lat: string | null; // DECIMAL comes back as string from pg
  location_lon: string | null;
  interests: string[] | null;
  photos: string[] | null;
  updated_at: string;
}

export async function getProfileByUserId(
  userId: number
): Promise<ProfileRow | null> {
  const rows = await dbQuery<ProfileRow>(
    `
    SELECT
      p.user_id,
      p.display_name,
      p.bio,
      p.major,
      p.graduation_year,
      p.is_dating_enabled,
      p.is_friends_enabled,
      p.dating_gender_preference,
      p.friends_gender_preference,
      p.min_age_preference,
      p.max_age_preference,
      p.max_distance_km,
      p.show_me_in_discovery,
      p.location_lat,
      p.location_lon,
      p.interests,
      p.photos,
      p.updated_at,
      u.school_id,
      s.name AS school_name,
      s.short_name AS school_short_name
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN schools s ON s.id = u.school_id
    WHERE p.user_id = $1
    `,
    [userId]
  );
  return rows[0] ?? null;
}

export interface ProfileUpdateInput {
  display_name?: string | null;
  bio?: string | null;
  major?: string | null;
  graduation_year?: number | null;
  is_dating_enabled?: boolean;
  is_friends_enabled?: boolean;
  dating_gender_preference?: string | null;
  friends_gender_preference?: string | null;
  min_age_preference?: number | null;
  max_age_preference?: number | null;
  max_distance_km?: number | null;
  show_me_in_discovery?: boolean;
  interests?: string[] | null;
  photos?: string[] | null;
}

// partial update builder
export async function updateProfileByUserId(
  userId: number,
  updates: ProfileUpdateInput
): Promise<ProfileRow | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx += 1;
  }

  // no fields to update
  if (fields.length === 0) {
    return getProfileByUserId(userId);
  }

  // add userId + updated_at
  values.push(userId);
  const userIdIndex = idx;
  const setClause =
    fields.join(", ") + `, updated_at = NOW()`;

  const rows = await dbQuery<ProfileRow>(
    `
    UPDATE profiles
    SET ${setClause}
    WHERE user_id = $${userIdIndex}
    RETURNING
      user_id,
      display_name,
      bio,
      major,
      graduation_year,
      is_dating_enabled,
      is_friends_enabled,
      dating_gender_preference,
      friends_gender_preference,
      min_age_preference,
      max_age_preference,
      max_distance_km,
      show_me_in_discovery,
      location_lat,
      location_lon,
      interests,
      photos,
      updated_at
    `,
    values
  );

  return rows[0] ?? null;
}
