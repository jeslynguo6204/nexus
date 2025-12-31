import { dbQuery } from "../../db/pool";

export interface PhotoRow {
  id: number;
  user_id: number;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface AffiliationInfo {
  id: number;
  name: string;
  short_name: string | null;
  category_id: number;
  category_name: string;
  is_dorm: boolean;
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
  location_description: string | null;
  hometown: string | null;
  languages: string | null;
  height: number | null;
  religious_beliefs: string | null;
  political_affiliation: string | null;
  ethnicity: string | null;
  affiliations: number[] | null;
  featured_affiliations: number[] | null;
  affiliations_info?: AffiliationInfo[] | null; // Resolved affiliation names
  dorm?: AffiliationInfo | null; // Dorm affiliation if any
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
      p.location_description,
      p.hometown,
      p.languages,
      p.height,
      p.religious_beliefs,
      p.political_affiliation,
      p.ethnicity,
      p.affiliations,
      p.featured_affiliations,
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

  // For each profile, fetch their photos and resolve affiliations
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

      // Resolve affiliations from IDs to names
      let affiliationsInfo: AffiliationInfo[] = [];
      let dorm: AffiliationInfo | null = null;

      if (profile.affiliations && Array.isArray(profile.affiliations) && profile.affiliations.length > 0) {
        // Fetch affiliation details
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
          [profile.affiliations]
        );

        // Check if any affiliation is a dorm (category name is "Dorm" or similar)
        const dormCategory = await dbQuery<{ id: number }>(
          `SELECT id FROM affiliation_categories WHERE LOWER(name) = 'dorm' OR LOWER(name) = 'dorms' LIMIT 1`
        );
        const dormCategoryId = dormCategory[0]?.id;

        affiliationsInfo = affiliationRows.map(row => ({
          id: row.id,
          name: row.name,
          short_name: row.short_name,
          category_id: row.category_id,
          category_name: row.category_name,
          is_dorm: row.category_id === dormCategoryId,
        }));

        // Find dorm if any
        const dormAffil = affiliationsInfo.find(a => a.is_dorm);
        if (dormAffil) {
          dorm = dormAffil;
          // Remove dorm from affiliations list (show it separately)
          affiliationsInfo = affiliationsInfo.filter(a => !a.is_dorm);
        }
      }

      return {
        ...profile,
        photos,
        affiliations_info: affiliationsInfo.length > 0 ? affiliationsInfo : null,
        dorm: dorm || null,
      };
    })
  );

  return profilesWithPhotos;
}
