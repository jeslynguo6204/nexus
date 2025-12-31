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
  school_id: number | null;
  school_name: string | null;
  school_short_name: string | null;
  age: number | null;
  date_of_birth: string | null;
}

export async function getSimpleFeed(includeAllForTesting = false): Promise<FeedProfileRow[]> {
  // Fetch all profiles with show_me_in_discovery = true
  // If includeAllForTesting is true, include all profiles (for hardcoded ordering testing)
  const whereClause = includeAllForTesting 
    ? '1=1' // Include all profiles
    : 'p.show_me_in_discovery = TRUE';
  
  const limitClause = includeAllForTesting ? 'LIMIT 100' : 'LIMIT 25';
    
  const profiles = await dbQuery<FeedProfileRow>(
    `
    SELECT
      p.user_id,
      p.display_name,
      p.bio,
      p.major,
      p.graduation_year,
      p.interests,
      p.age,
      p.date_of_birth,
      u.school_id,
      s.name AS school_name,
      s.short_name AS school_short_name
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN schools s ON s.id = u.school_id
    WHERE ${whereClause}
    ORDER BY p.updated_at DESC
    ${limitClause}
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
