import { dbQuery } from "../../db/pool";

export interface PhotoRow {
  id: number;
  user_id: number;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface FeedProfileRow {
  user_id: number;
  display_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
  interests?: string[] | null;
  photos?: PhotoRow[];
}

export async function getSimpleFeed(): Promise<FeedProfileRow[]> {
  // Fetch all profiles with show_me_in_discovery = true
  const profiles = await dbQuery<FeedProfileRow>(
    `
    SELECT
      user_id,
      display_name,
      bio,
      major,
      graduation_year,
      interests
    FROM profiles
    WHERE show_me_in_discovery = TRUE
    ORDER BY updated_at DESC
    LIMIT 25
    `
  );

  // For each profile, fetch their photos
  const profilesWithPhotos = await Promise.all(
    profiles.map(async (profile) => {
      const photos = await dbQuery<PhotoRow>(
        `
        SELECT id, user_id, url, sort_order, is_primary, created_at
        FROM photos
        WHERE user_id = $1
        ORDER BY sort_order ASC, created_at ASC
        `,
        [profile.user_id]
      );
      return {
        ...profile,
        photos,
      };
    })
  );

  return profilesWithPhotos;
}
