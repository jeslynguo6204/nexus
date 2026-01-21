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
  academic_year: string | null;
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
  gender: string | null;
  dating_gender_preference: string | null;
  friends_gender_preference: string | null;
  affiliations_info?: AffiliationInfo[] | null; // Resolved affiliation names
  dorm?: AffiliationInfo | null; // Dorm affiliation if any
}

export async function getSimpleFeed(
  userId: number,
  options?: {
    mode?: 'romantic' | 'platonic';
    scope?: 'school' | 'league' | 'area';
    includeAllForTesting?: boolean;
  }
): Promise<FeedProfileRow[]> {
  const includeAllForTesting = options?.includeAllForTesting || false;
  const mode = options?.mode || 'romantic';
  const scope = options?.scope || 'school';
  
  // Get user's school_id for filtering
  const userSchoolResult = await dbQuery<{ school_id: number | null }>(
    `SELECT school_id FROM users WHERE id = $1`,
    [userId]
  );
  const userSchoolId = userSchoolResult[0]?.school_id;
  
  // Build WHERE clause conditions
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  // Exclude current user
  conditions.push(`p.user_id != $${paramIndex++}`);
  params.push(userId);
  
  // Show me in discovery flag (unless testing)
  if (!includeAllForTesting) {
    conditions.push(`p.show_me_in_discovery = TRUE`);
  }
  
  // Mode filtering: is_dating_enabled for romantic, is_friends_enabled for platonic
  if (mode === 'romantic') {
    conditions.push(`p.is_dating_enabled = TRUE`);
  } else if (mode === 'platonic') {
    conditions.push(`p.is_friends_enabled = TRUE`);
  }
  
  // Scope filtering: same school for now (league and area will be added later)
  if (scope === 'school' && userSchoolId) {
    conditions.push(`u.school_id = $${paramIndex++}`);
    params.push(userSchoolId);
  }
  
  // Determine which tables to use based on mode
  const likesTable = mode === 'platonic' ? 'friend_likes' : 'dating_likes';
  const passesTable = mode === 'platonic' ? 'friend_passes' : 'dating_passes';
  const matchesTable = mode === 'platonic' ? 'friend_matches' : 'dating_matches';
  
  // Count total swipes (likes + passes) for this user in this mode
  // If user has swiped 3+ times, allow showing previously liked/passed profiles
  let totalSwipes = 0;
  try {
    const swipeCountResult = await dbQuery<{ count: string }>(
      `
      SELECT 
        (SELECT COUNT(*) FROM ${likesTable} WHERE liker_id = $1) +
        (SELECT COUNT(*) FROM ${passesTable} WHERE passer_id = $1) as count
      `,
      [userId]
    );
    totalSwipes = parseInt(swipeCountResult[0]?.count || '0', 10);
  } catch (e) {
    console.warn('Could not count swipes (tables might not exist):', e);
    // Default to 0 if we can't count
  }
  
  const showOldCards = totalSwipes >= 3;
  
  // Exclude blocked users (bidirectional - exclude if either user blocked the other)
  try {
    const blockParam = paramIndex++;
    conditions.push(`
      NOT EXISTS (
        SELECT 1 FROM blocks b
        WHERE b.is_active = TRUE
          AND (
            (b.blocker_id = $${blockParam} AND b.blocked_id = p.user_id)
            OR (b.blocker_id = p.user_id AND b.blocked_id = $${blockParam})
          )
      )
    `);
    params.push(userId);
  } catch (e) {
    console.warn('Could not add block exclusion (table might not exist):', e);
  }
  
  // Exclude users who are matched with the current user (only if table exists)
  // Use a safer approach that won't fail if tables don't exist
  try {
    const matchParam = paramIndex++;
    conditions.push(`
      NOT EXISTS (
        SELECT 1 FROM ${matchesTable} m
        WHERE m.is_active = TRUE 
          AND m.unmatched_at IS NULL
          AND (
            (m.matcher_id = $${matchParam} AND m.matchee_id = p.user_id)
            OR (m.matchee_id = $${matchParam} AND m.matcher_id = p.user_id)
          )
      )
    `);
    params.push(userId);
  } catch (e) {
    console.warn('Could not add match exclusion (table might not exist):', e);
  }
  
  // Exclude users who have been liked or passed ONLY if user has swiped < 3 times
  // After 3 swipes, allow showing previously liked/passed profiles again
  if (!showOldCards) {
    try {
      const likesParam = paramIndex++;
      const passesParam = paramIndex++;
      conditions.push(`
        NOT EXISTS (
          SELECT 1 FROM ${likesTable} WHERE liker_id = $${likesParam} AND likee_id = p.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM ${passesTable} WHERE passer_id = $${passesParam} AND passee_id = p.user_id
        )
      `);
      params.push(userId);
      params.push(userId);
    } catch (e) {
      console.warn('Could not add like/pass exclusion (tables might not exist):', e);
    }
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = includeAllForTesting ? 'LIMIT 100' : 'LIMIT 25';
  
  const query = `
    SELECT
      p.user_id,
      p.display_name,
      p.bio,
      p.major,
      p.graduation_year,
      p.academic_year,
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
      p.gender,
      p.dating_gender_preference,
      p.friends_gender_preference,
      u.school_id,
      s.name AS school_name,
      s.short_name AS school_short_name
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN schools s ON s.id = u.school_id
    ${whereClause}
    ORDER BY p.updated_at DESC
    ${limitClause}
  `;
  
  let profiles: FeedProfileRow[];
  try {
    console.log('Feed query params:', { userId, mode, scope, paramCount: params.length, totalSwipes, showOldCards });
    console.log('Feed query (first 500 chars):', query.substring(0, 500));
    console.log('Using tables:', { likesTable, passesTable, matchesTable });
    profiles = await dbQuery<FeedProfileRow>(query, params);
    console.log('Feed query succeeded, got', profiles.length, 'profiles');
  } catch (error: any) {
    console.error('=== FEED QUERY ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Full query:', query);
    console.error('Query params:', params);
    console.error('Using tables:', { likesTable, passesTable, matchesTable });
    console.error('========================');
    // Re-throw with more context
    const enhancedError = new Error(`Feed query failed: ${error.message || error}. Tables: ${likesTable}, ${passesTable}, ${matchesTable}`);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }

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

        // Check if any affiliation is a dorm (category name is "Dorm" or similar, but NOT "House")
        // Houses (e.g., Harvard houses) should be treated as regular affiliations, not dorms
        const dormCategory = await dbQuery<{ id: number }>(
          `SELECT id FROM affiliation_categories 
           WHERE (LOWER(name) = 'dorm' OR LOWER(name) = 'dorms' OR LOWER(name) LIKE '%dorm%')
           AND LOWER(name) NOT LIKE '%house%'
           LIMIT 1`
        );
        const dormCategoryId = dormCategory[0]?.id;

        affiliationsInfo = affiliationRows.map(row => {
          // Only mark as dorm if category matches dorm category AND is not a house
          const isDorm = row.category_id === dormCategoryId && 
                        !row.category_name.toLowerCase().includes('house');
          return {
            id: row.id,
            name: row.name,
            short_name: row.short_name,
            category_id: row.category_id,
            category_name: row.category_name,
            is_dorm: isDorm,
          };
        });

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
