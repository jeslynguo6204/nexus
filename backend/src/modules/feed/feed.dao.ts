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
  affiliations_info?: AffiliationInfo[] | null;
  dorm?: AffiliationInfo | null;
}

type Mode = "romantic" | "platonic";
type Scope = "school" | "league" | "area";

/**
 * Fetch eligible feed profiles for a user.
 *
 * Eligibility criteria (SQL):
 * 1. Viewer has gender
 * 2. Profile has gender (not null)
 * 3. Viewer's preference includes profile's gender (or viewer pref is 'everyone')
 * 4. Profile's preference includes viewer's gender (or profile pref is 'everyone')
 * 5. Profile has mode enabled (is_dating_enabled or is_friends_enabled)
 * 6. Profile is in discovery (show_me_in_discovery = true)
 * 7. Same scope (school/league/area)
 * 8. No active block between viewer and profile
 * 9. No active match between viewer and profile
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
  }>(
    `
    SELECT u.school_id,
           p.gender,
           p.dating_gender_preference,
           p.friends_gender_preference
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

  // Scope filtering
  if (scope === "school" && viewerSchoolId) {
    conditions.push(`u.school_id = $${i++}`);
    params.push(viewerSchoolId);
  }

  // --- Bidirectional gender eligibility (DAO-level hard constraint) ---
  //
  // viewer wants profile:
  //   viewerPref == 'everyone' OR viewerPref == p.gender
  //
  // profile wants viewer:
  //   profilePref == 'everyone' OR profilePref == viewer.gender
  //
  // Also require profile.gender not null.
  //
  const viewerGenderParam = i++;
  params.push(viewer.gender);

  const viewerPrefParam = i++;
  params.push(viewerPref); // can be null => treated as everyone in SQL

  // Choose which preference column to use for *profiles* in this mode
  const profilePrefColumn =
    mode === "romantic" ? "p.dating_gender_preference" : "p.friends_gender_preference";

  conditions.push(`
    p.gender IS NOT NULL
    AND (
      COALESCE($${viewerPrefParam}, 'everyone') = 'everyone'
      OR p.gender = COALESCE($${viewerPrefParam}, 'everyone')
    )
    AND (
      COALESCE(${profilePrefColumn}, 'everyone') = 'everyone'
      OR COALESCE(${profilePrefColumn}, 'everyone') = $${viewerGenderParam}
    )
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
