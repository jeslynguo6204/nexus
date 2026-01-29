import { dbQuery } from "../../db/pool";

export interface ProfileRow {
  user_id: number;
  display_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
  academic_year: string | null; // ENUM: 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'
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
  dating_gender_preference: string[] | null;
  friends_gender_preference: string[] | null;
  min_age_preference: number | null;
  max_age_preference: number | null;
  max_distance_km: number | null;
  show_me_in_discovery: boolean;
  location_lat: string | null; // DECIMAL comes back as string from pg
  location_lon: string | null;
  location_description: string | null;
  interests: string[] | null;
  likes: string[] | null;
  dislikes: string[] | null;
  photos: string[] | null;
  affiliations: number[] | null; // Array of affiliation IDs
  gender: string | null;
  sexuality: string | null;
  pronouns: string | null;
  religious_beliefs: string | null;
  height: number | null; // DECIMAL comes back as number from pg
  political_affiliation: string | null;
  languages: string | null;
  hometown: string | null;
  ethnicity: string | null; // Stored as comma-separated string
  age: number | null;
  date_of_birth: string | null; // DATE comes back as string from pg
  featured_affiliations: number[] | null; // Array of affiliation IDs (up to 2) for preview
  friend_count?: number;
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
      p.academic_year,
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
      p.location_description,
      p.interests,
      p.likes,
      p.dislikes,
      p.photos,
      p.affiliations,
      p.gender,
      p.sexuality,
      p.pronouns,
      p.religious_beliefs,
      p.height,
      p.political_affiliation,
      p.languages,
      p.hometown,
      p.ethnicity,
      p.age,
      p.date_of_birth,
      p.featured_affiliations,
      p.updated_at,
      u.school_id,
      s.name AS school_name,
      s.short_name AS school_short_name,
      (
        SELECT COUNT(*)
        FROM friendships f
        WHERE (f.user_id_1 = p.user_id OR f.user_id_2 = p.user_id)
          AND f.status = 'accepted'
      ) AS friend_count
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
  academic_year?: string | null; // ENUM: 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'
  is_dating_enabled?: boolean;
  is_friends_enabled?: boolean;
  dating_gender_preference?: string[] | null;
  friends_gender_preference?: string[] | null;
  min_age_preference?: number | null;
  max_age_preference?: number | null;
  max_distance_km?: number | null;
  show_me_in_discovery?: boolean;
  location_lat?: string | null;
  location_lon?: string | null;
  location_description?: string | null;
  interests?: string[] | null;
  likes?: string[] | null;
  dislikes?: string[] | null;
  photos?: string[] | null;
  affiliations?: number[] | null; // Array of affiliation IDs
  gender?: string | null;
  sexuality?: string | null;
  pronouns?: string | null;
  religious_beliefs?: string | null;
  height?: number | null;
  political_affiliation?: string | null;
  languages?: string | null;
  hometown?: string | null;
  ethnicity?: string | null;
  age?: number | null;
  date_of_birth?: string | null;
  featured_affiliations?: number[] | null;
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
      academic_year,
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
      location_description,
      interests,
      likes,
      dislikes,
      photos,
      affiliations,
      gender,
      sexuality,
      pronouns,
      religious_beliefs,
      height,
      political_affiliation,
      languages,
      hometown,
      ethnicity,
      age,
      date_of_birth,
      featured_affiliations,
      updated_at
    `,
    values
  );

  return rows[0] ?? null;
}

/**
 * Get public profile info for another user (excludes private preferences)
 */
export async function getPublicProfileByUserId(
  userId: number,
  currentUserId: number
): Promise<any | null> {
  const rows = await dbQuery(
    `
    SELECT
      p.user_id,
      p.display_name,
      p.bio,
      p.major,
      p.graduation_year,
      p.academic_year,
      p.interests,
      p.likes,
      p.dislikes,
      p.photos,
      p.affiliations,
      p.gender,
      p.sexuality,
      p.pronouns,
      p.religious_beliefs,
      p.height,
      p.political_affiliation,
      p.languages,
      p.hometown,
      p.ethnicity,
      p.age,
      p.featured_affiliations,
      u.school_id,
      s.name AS school_name,
      s.short_name AS school_short_name,
      (
        SELECT COUNT(*)
        FROM friendships f
        WHERE (f.user_id_1 = p.user_id OR f.user_id_2 = p.user_id)
          AND f.status = 'accepted'
      ) AS friend_count,
      (
        CASE
          WHEN EXISTS (
            SELECT 1 FROM friendships f
            WHERE ((f.user_id_1 = $2 AND f.user_id_2 = p.user_id) OR (f.user_id_1 = p.user_id AND f.user_id_2 = $2))
              AND f.status = 'accepted'
          ) THEN 'friends'
          WHEN EXISTS (
            SELECT 1 FROM friend_requests fr
            WHERE fr.requester_id = $2 AND fr.recipient_id = p.user_id
          ) THEN 'pending_sent'
          WHEN EXISTS (
            SELECT 1 FROM friend_requests fr
            WHERE fr.requester_id = p.user_id AND fr.recipient_id = $2
          ) THEN 'pending_received'
          ELSE 'none'
        END
      ) AS friendship_status
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN schools s ON s.id = u.school_id
    WHERE p.user_id = $1
    `,
    [userId, currentUserId]
  );
  return rows[0] ?? null;
}

/**
 * Calculate age from date_of_birth
 */
export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Update ages for all users whose birthday is today
 * This should be called daily (e.g., via a cron job)
 */
export async function updateAgesForBirthdays(): Promise<number> {
  const today = new Date();
  const month = today.getMonth() + 1; // getMonth() returns 0-11
  const day = today.getDate();
  
  // Find all profiles where date_of_birth month and day match today
  const rows = await dbQuery<{ user_id: number; date_of_birth: string }>(
    `
    SELECT user_id, date_of_birth
    FROM profiles
    WHERE date_of_birth IS NOT NULL
      AND EXTRACT(MONTH FROM date_of_birth) = $1
      AND EXTRACT(DAY FROM date_of_birth) = $2
    `,
    [month, day]
  );
  
  let updatedCount = 0;
  
  for (const row of rows) {
    const age = calculateAge(row.date_of_birth);
    if (age !== null) {
      await dbQuery(
        `
        UPDATE profiles
        SET age = $1, updated_at = NOW()
        WHERE user_id = $2
        `,
        [age, row.user_id]
      );
      updatedCount++;
    }
  }
  
  return updatedCount;
}
