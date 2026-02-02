// backend/src/modules/swipes/swipes.dao.ts
import { dbQuery } from "../../db/pool";

export type DatingLikeRow = {
  id: number;
  liker_id: number;
  likee_id: number;
  created_at: string;
};

export type DatingPassRow = {
  id: number;
  passer_id: number;
  passee_id: number;
  created_at: string;
};

export type DatingMatchRow = {
  id: number;
  matcher_id: number;
  matchee_id: number;
  channel_id: string;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  unmatched_at: string | null;
};

export async function createDatingLike(
  likerId: number,
  likeeId: number
): Promise<DatingLikeRow> {
  const rows = await dbQuery<DatingLikeRow>(
    `
    INSERT INTO dating_likes (liker_id, likee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (liker_id, likee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, liker_id, likee_id, created_at
    `,
    [likerId, likeeId]
  );
  return rows[0];
}

export async function createDatingPass(
  passerId: number,
  passeeId: number
): Promise<DatingPassRow> {
  const rows = await dbQuery<DatingPassRow>(
    `
    INSERT INTO dating_passes (passer_id, passee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (passer_id, passee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, passer_id, passee_id, created_at
    `,
    [passerId, passeeId]
  );
  return rows[0];
}

export async function getDatingLike(
  likerId: number,
  likeeId: number
): Promise<DatingLikeRow | null> {
  const rows = await dbQuery<DatingLikeRow>(
    `
    SELECT id, liker_id, likee_id, created_at
    FROM dating_likes
    WHERE liker_id = $1 AND likee_id = $2
    `,
    [likerId, likeeId]
  );
  return rows[0] ?? null;
}

export async function getDatingPass(
  passerId: number,
  passeeId: number
): Promise<DatingPassRow | null> {
  const rows = await dbQuery<DatingPassRow>(
    `
    SELECT id, passer_id, passee_id, created_at
    FROM dating_passes
    WHERE passer_id = $1 AND passee_id = $2
    `,
    [passerId, passeeId]
  );
  return rows[0] ?? null;
}

export async function checkMutualLike(
  userId1: number,
  userId2: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM dating_likes
      WHERE liker_id = $1 AND likee_id = $2
    ) AND EXISTS(
      SELECT 1 FROM dating_likes
      WHERE liker_id = $2 AND likee_id = $1
    ) AS exists
    `,
    [userId1, userId2]
  );
  return rows[0]?.exists ?? false;
}

export async function createDatingMatch(
  matcherId: number,
  matcheeId: number
): Promise<DatingMatchRow> {
  const rows = await dbQuery<DatingMatchRow>(
    `
    INSERT INTO dating_matches (matcher_id, matchee_id, is_active)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (matcher_id, matchee_id) DO NOTHING
    RETURNING id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    `,
    [matcherId, matcheeId]
  );
  return rows[0];
}

export async function getDatingMatch(
  userId1: number,
  userId2: number
): Promise<DatingMatchRow | null> {
  const rows = await dbQuery<DatingMatchRow>(
    `
    SELECT id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    FROM dating_matches
    WHERE (matcher_id = $1 AND matchee_id = $2) OR (matcher_id = $2 AND matchee_id = $1)
    `,
    [userId1, userId2]
  );
  return rows[0] ?? null;
}

// Friend mode functions (mirror dating mode)
export type FriendLikeRow = {
  id: number;
  liker_id: number;
  likee_id: number;
  created_at: string;
};

export type FriendPassRow = {
  id: number;
  passer_id: number;
  passee_id: number;
  created_at: string;
};

export type FriendMatchRow = {
  id: number;
  matcher_id: number;
  matchee_id: number;
  channel_id: string;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  unmatched_at: string | null;
};

export async function createFriendLike(
  likerId: number,
  likeeId: number
): Promise<FriendLikeRow> {
  const rows = await dbQuery<FriendLikeRow>(
    `
    INSERT INTO friend_likes (liker_id, likee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (liker_id, likee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, liker_id, likee_id, created_at
    `,
    [likerId, likeeId]
  );
  return rows[0];
}

export async function createFriendPass(
  passerId: number,
  passeeId: number
): Promise<FriendPassRow> {
  const rows = await dbQuery<FriendPassRow>(
    `
    INSERT INTO friend_passes (passer_id, passee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (passer_id, passee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, passer_id, passee_id, created_at
    `,
    [passerId, passeeId]
  );
  return rows[0];
}

export async function getFriendLike(
  likerId: number,
  likeeId: number
): Promise<FriendLikeRow | null> {
  const rows = await dbQuery<FriendLikeRow>(
    `
    SELECT id, liker_id, likee_id, created_at
    FROM friend_likes
    WHERE liker_id = $1 AND likee_id = $2
    `,
    [likerId, likeeId]
  );
  return rows[0] ?? null;
}

export async function getFriendPass(
  passerId: number,
  passeeId: number
): Promise<FriendPassRow | null> {
  const rows = await dbQuery<FriendPassRow>(
    `
    SELECT id, passer_id, passee_id, created_at
    FROM friend_passes
    WHERE passer_id = $1 AND passee_id = $2
    `,
    [passerId, passeeId]
  );
  return rows[0] ?? null;
}

export async function checkMutualFriendLike(
  userId1: number,
  userId2: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM friend_likes
      WHERE liker_id = $1 AND likee_id = $2
    ) AND EXISTS(
      SELECT 1 FROM friend_likes
      WHERE liker_id = $2 AND likee_id = $1
    ) AS exists
    `,
    [userId1, userId2]
  );
  return rows[0]?.exists ?? false;
}

export async function createFriendMatch(
  matcherId: number,
  matcheeId: number
): Promise<FriendMatchRow> {
  const rows = await dbQuery<FriendMatchRow>(
    `
    INSERT INTO friend_matches (matcher_id, matchee_id, is_active)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (matcher_id, matchee_id) DO NOTHING
    RETURNING id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    `,
    [matcherId, matcheeId]
  );
  return rows[0];
}

export async function getFriendMatch(
  userId1: number,
  userId2: number
): Promise<FriendMatchRow | null> {
  const rows = await dbQuery<FriendMatchRow>(
    `
    SELECT id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    FROM friend_matches
    WHERE (matcher_id = $1 AND matchee_id = $2) OR (matcher_id = $2 AND matchee_id = $1)
    `,
    [userId1, userId2]
  );
  return rows[0] ?? null;
}

// Get profiles that have liked the current user (received likes)
export interface AffiliationInfo {
  id: number;
  name: string;
  short_name: string | null;
  category_id: number;
  category_name: string;
  is_dorm: boolean;
}

export interface ReceivedLikeProfile {
  user_id: number;
  display_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
  academic_year: string | null;
  interests: string[] | null;
  likes: string[] | null;
  dislikes: string[] | null;
  photos: string[] | null;
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
  affiliations_info?: AffiliationInfo[] | null;
  dorm?: AffiliationInfo | null;
  gender: string | null;
  dating_gender_preference: string[] | null;
  friends_gender_preference: string[] | null;
  mutual_count?: number;
  like_created_at: string;
}

export async function getReceivedLikesProfiles(
  userId: number,
  mode: 'romantic' | 'platonic' = 'romantic'
): Promise<ReceivedLikeProfile[]> {
  const likesTable = mode === 'romantic' ? 'dating_likes' : 'friend_likes';
  const passesTable = mode === 'romantic' ? 'dating_passes' : 'friend_passes';
  const matchesTable = mode === 'romantic' ? 'dating_matches' : 'friend_matches';

  const rows = await dbQuery<ReceivedLikeProfile>(
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
        FROM (
          SELECT
            CASE
              WHEN f.user_id_1 = $1 THEN f.user_id_2
              ELSE f.user_id_1
            END AS friend_id
          FROM friendships f
          WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
            AND f.status = 'accepted'
        ) cf
        JOIN (
          SELECT
            CASE
              WHEN f.user_id_1 = p.user_id THEN f.user_id_2
              ELSE f.user_id_1
            END AS friend_id
          FROM friendships f
          WHERE (f.user_id_1 = p.user_id OR f.user_id_2 = p.user_id)
            AND f.status = 'accepted'
        ) pf ON pf.friend_id = cf.friend_id
      ) AS mutual_count,
      l.created_at AS like_created_at,
      ARRAY_AGG(ph.url ORDER BY ph.sort_order, ph.created_at) FILTER (WHERE ph.url IS NOT NULL) AS photos
    FROM ${likesTable} l
    JOIN profiles p ON p.user_id = l.liker_id
    JOIN users u ON u.id = p.user_id
    LEFT JOIN schools s ON s.id = u.school_id
    LEFT JOIN photos ph ON ph.user_id = p.user_id
    WHERE l.likee_id = $1
      -- Exclude if current user has passed on them
      AND NOT EXISTS (
        SELECT 1 FROM ${passesTable} pass
        WHERE pass.passer_id = $1 AND pass.passee_id = l.liker_id
      )
      -- Exclude if already matched
      AND NOT EXISTS (
        SELECT 1 FROM ${matchesTable} m
        WHERE m.is_active = TRUE
          AND m.unmatched_at IS NULL
          AND (
            (m.matcher_id = $1 AND m.matchee_id = l.liker_id)
            OR (m.matchee_id = $1 AND m.matcher_id = l.liker_id)
          )
      )
      -- Exclude if blocked (bidirectional)
      AND NOT EXISTS (
        SELECT 1 FROM blocks b
        WHERE b.is_active = TRUE
          AND (
            (b.blocker_id = $1 AND b.blocked_id = l.liker_id)
            OR (b.blocker_id = l.liker_id AND b.blocked_id = $1)
          )
      )
    GROUP BY
      p.user_id, p.display_name, p.bio, p.major, p.graduation_year, p.academic_year,
      p.interests, p.likes, p.dislikes, p.age, p.date_of_birth, p.location_description,
      p.hometown, p.languages, p.height, p.religious_beliefs, p.political_affiliation,
      p.ethnicity, p.affiliations, p.featured_affiliations, p.gender,
      p.dating_gender_preference, p.friends_gender_preference,
      u.school_id, s.name, s.short_name, l.created_at
    ORDER BY l.created_at DESC
    `,
    [userId]
  );

  // Attach resolved affiliations info for each profile
  const profilesWithAffiliations = await Promise.all(
    rows.map(async (profile) => {
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
        affiliations_info: affiliationsInfo.length ? affiliationsInfo : null,
        dorm,
      };
    })
  );

  return profilesWithAffiliations;
}
