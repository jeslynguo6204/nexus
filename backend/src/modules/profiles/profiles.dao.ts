import { dbQuery } from "../../db/pool";

export interface ProfileRow {
  user_id: number;
  display_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
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
  updated_at: string;
}

export async function getProfileByUserId(
  userId: number
): Promise<ProfileRow | null> {
  const rows = await dbQuery<ProfileRow>(
    `
    SELECT
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
      updated_at
    FROM profiles
    WHERE user_id = $1
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
      updated_at
    `,
    values
  );

  return rows[0] ?? null;
}