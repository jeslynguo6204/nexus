/**
 * feed.dao.ts
 *
 * Responsibility: ELIGIBILITY & FETCHING
 * - Enforces gender bidirectional matching in SQL
 * - Filters by mode (dating/friends enabled + preferences)
 * - Filters by scope (school/league/area)
 * - Excludes blocks and active matches
 * - Returns ONLY eligible profiles ready for ranking
 * - Does NOT determine ordering
 */

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
  likes?: string[] | null;
  dislikes?: string[] | null;
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
  dating_gender_preference: string[] | null;
  friends_gender_preference: string[] | null;
  affiliations_info?: AffiliationInfo[] | null;
  dorm?: AffiliationInfo | null;
  friend_count?: number;
  friendship_status?: string;
}

type Mode = "romantic" | "platonic";
type Scope = "school" | "league" | "area";

/**
 * Fetch eligible feed profiles for a user.
 *
 * Eligibility criteria (SQL):
 * 1. Viewer has gender
 * 2. Viewer has at least one photo
 * 3. Viewer has at least one mode enabled (dating OR friends)
 * 4. Viewer has the current mode enabled (romantic or platonic)
 * 5. Profile has gender (not null)
 * 6. Profile has at least one photo
 * 7. Viewer's preference array includes profile's gender (p.gender = ANY(viewer_pref))
 * 8. Profile's preference array includes viewer's gender (viewer.gender = ANY(profile_pref))
 * 9. Profile has mode enabled (is_dating_enabled or is_friends_enabled)
 * 10. Profile is in discovery (show_me_in_discovery = true)
 * 11. Same scope (school/league/area)
 * 12. No active block between viewer and profile
 * 13. No active match between viewer and profile
 *
 * @param userId Viewer user ID
 * @param options Mode, scope, testing flag, limit
 * @returns Eligible profiles ready for ranking/ordering
 */
export async function getEligibleFeedProfiles(
  userId: number,
  options?: {
    mode?: Mode;
    scope?: Scope;
    includeAllForTesting?: boolean;
    limit?: number;
  }
): Promise<FeedProfileRow[]> {
  const includeAllForTesting = options?.includeAllForTesting ?? false;
  const mode: Mode = options?.mode ?? "romantic";
  const scope: Scope = options?.scope ?? "school";
  const limit = options?.limit ?? (includeAllForTesting ? 100 : 25);

  // Fetch viewer info needed for eligibility
  const viewerRows = await dbQuery<{
    school_id: number | null;
    gender: string | null;
    dating_gender_preference: string | null;
    friends_gender_preference: string | null;
    is_dating_enabled: boolean;
    is_friends_enabled: boolean;
    photo_count: number;
  }>(
    `
    SELECT u.school_id,
           p.gender,
           p.dating_gender_preference,
           p.friends_gender_preference,
           p.is_dating_enabled,
           p.is_friends_enabled,
           (SELECT COUNT(*) FROM photos ph WHERE ph.user_id = u.id) AS photo_count
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.id = $1
    `,
    [userId]
  );

  const viewer = viewerRows[0];

  // If viewer has no profile or no gender, strict = empty feed
  if (!viewer || !viewer.gender) {
    return [];
  }

  // If viewer has no photos, return empty feed
  if (viewer.photo_count === 0) {
    return [];
  }

  // If viewer doesn't have at least one mode enabled, return empty feed
  if (!viewer.is_dating_enabled && !viewer.is_friends_enabled) {
    return [];
  }

  // If viewer doesn't have the current mode enabled, return empty feed
  if (mode === "romantic" && !viewer.is_dating_enabled) {
    return [];
  }
  if (mode === "platonic" && !viewer.is_friends_enabled) {
    return [];
  }

  const viewerSchoolId = viewer.school_id ?? null;

  // In this mode, which preference column is relevant?
  const viewerPref =
    mode === "romantic"
      ? viewer.dating_gender_preference
      : viewer.friends_gender_preference;

  // Tables for mode
  const matchesTable = mode === "platonic" ? "friend_matches" : "dating_matches";

  const conditions: string[] = [];
  const params: any[] = [];
  let i = 1;

  // Exclude current user
  conditions.push(`p.user_id != $${i++}`);
  params.push(userId);

  // Show me in discovery
  if (!includeAllForTesting) {
    conditions.push(`p.show_me_in_discovery = TRUE`);
  }

  // Mode enabled filtering
  if (mode === "romantic") {
    conditions.push(`p.is_dating_enabled = TRUE`);
  } else {
    conditions.push(`p.is_friends_enabled = TRUE`);
  }

  // Require at least one photo
  conditions.push(`
    EXISTS (
      SELECT 1 FROM photos ph
      WHERE ph.user_id = p.user_id
    )
  `);

  // Scope filtering
  if (scope === "school" && viewerSchoolId) {
    conditions.push(`u.school_id = $${i++}`);
    params.push(viewerSchoolId);
  }

  // --- Bidirectional gender eligibility (array preferences) ---
  // Viewer's preference array includes profile's gender; profile's preference array includes viewer's gender.
  const viewerGenderParam = i++;
  params.push(viewer.gender);

  const viewerPrefParam = i++;
  params.push(Array.isArray(viewerPref) ? viewerPref : []);

  const profilePrefColumn =
    mode === "romantic" ? "p.dating_gender_preference" : "p.friends_gender_preference";

  // Use cast on every use of the array param so PostgreSQL can determine type (fixes "could not determine data type of parameter $4")
  const viewerPrefCast = `$${viewerPrefParam}::text[]`;
  conditions.push(`
    p.gender IS NOT NULL
    AND (${viewerPrefCast}) IS NOT NULL AND array_length(${viewerPrefCast}, 1) > 0 AND p.gender = ANY(${viewerPrefCast})
    AND ${profilePrefColumn} IS NOT NULL AND array_length(${profilePrefColumn}, 1) > 0 AND $${viewerGenderParam} = ANY(${profilePrefColumn})
  `);

  // Exclude blocked users (bidirectional)
  const blockParam = i++;
  params.push(userId);

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

  // Exclude users already matched (active + not unmatched)
  const matchParam = i++;
  params.push(userId);

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

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
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
            WHERE ((f.user_id_1 = $${blockParam} AND f.user_id_2 = p.user_id) OR (f.user_id_1 = p.user_id AND f.user_id_2 = $${blockParam}))
              AND f.status = 'accepted'
          ) THEN 'friends'
          WHEN EXISTS (
            SELECT 1 FROM friend_requests fr
            WHERE fr.requester_id = $${blockParam} AND fr.recipient_id = p.user_id
          ) THEN 'pending_sent'
          WHEN EXISTS (
            SELECT 1 FROM friend_requests fr
            WHERE fr.requester_id = p.user_id AND fr.recipient_id = $${blockParam}
          ) THEN 'pending_received'
          ELSE 'none'
        END
      ) AS friendship_status
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN schools s ON s.id = u.school_id
    ${whereClause}
    ORDER BY p.updated_at DESC
    LIMIT ${Number(limit)}
  `;

  let profiles: FeedProfileRow[];
  try {
    profiles = await dbQuery<FeedProfileRow>(query, params);
  } catch (error: any) {
    const enhancedError = new Error(`Feed query failed: ${error.message || error}`);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }

  // Attach photos + resolved affiliations
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

      let affiliationsInfo: AffiliationInfo[] = [];
      let dorm: AffiliationInfo | null = null;

      if (Array.isArray(profile.affiliations) && profile.affiliations.length > 0) {
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

        const dormCategory = await dbQuery<{ id: number }>(
          `SELECT id
           FROM affiliation_categories
           WHERE (LOWER(name) = 'dorm' OR LOWER(name) = 'dorms' OR LOWER(name) LIKE '%dorm%')
             AND LOWER(name) NOT LIKE '%house%'
           LIMIT 1`
        );
        const dormCategoryId = dormCategory[0]?.id;

        affiliationsInfo = affiliationRows.map((row) => {
          const isDorm =
            row.category_id === dormCategoryId &&
            !row.category_name.toLowerCase().includes("house");

          return {
            id: row.id,
            name: row.name,
            short_name: row.short_name,
            category_id: row.category_id,
            category_name: row.category_name,
            is_dorm: isDorm,
          };
        });

        const dormAffil = affiliationsInfo.find((a) => a.is_dorm);
        if (dormAffil) {
          dorm = dormAffil;
          affiliationsInfo = affiliationsInfo.filter((a) => !a.is_dorm);
        }
      }

      return {
        ...profile,
        photos,
        affiliations_info: affiliationsInfo.length ? affiliationsInfo : null,
        dorm,
      };
    })
  );

  return profilesWithPhotos;
}
