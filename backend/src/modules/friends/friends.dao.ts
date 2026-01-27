import { dbQuery, pool } from "../../db/pool";

/**
 * Database types for friends module
 */

export type FriendRequestRow = {
  id: number;
  requester_id: number;
  recipient_id: number;
  created_at: Date;
};

export type FriendshipRow = {
  id: number;
  user_id_1: number;
  user_id_2: number;
  status: "pending" | "accepted" | "blocked";
  created_at: Date;
  updated_at: Date;
};

export type FriendWithDetails = {
  friend_id: number;
  display_name: string;
  bio: string | null;
  age: number | null;
  school_name: string | null;
  school_short_name: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  featured_affiliation_short_names: string[];
};

export type FriendRequestWithDetails = {
  request_id: number;
  requester_id: number;
  display_name: string;
  bio: string | null;
  age: number | null;
  school_name: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  created_at: Date;
};

/**
 * DAO: Friend Requests
 */

export async function createFriendRequest(
  requesterId: number,
  recipientId: number
): Promise<FriendRequestRow> {
  const rows = await dbQuery<FriendRequestRow>(
    `INSERT INTO friend_requests (requester_id, recipient_id)
     VALUES ($1, $2)
     RETURNING id, requester_id, recipient_id, created_at`,
    [requesterId, recipientId]
  );
  return rows[0];
}

export async function deleteFriendRequest(
  requesterId: number,
  recipientId: number
): Promise<void> {
  await dbQuery(
    `DELETE FROM friend_requests WHERE requester_id = $1 AND recipient_id = $2`,
    [requesterId, recipientId]
  );
}

export async function getFriendRequest(
  requesterId: number,
  recipientId: number
): Promise<FriendRequestRow | null> {
  const rows = await dbQuery<FriendRequestRow>(
    `SELECT id, requester_id, recipient_id, created_at
     FROM friend_requests
     WHERE requester_id = $1 AND recipient_id = $2`,
    [requesterId, recipientId]
  );
  return rows[0] || null;
}

export async function getPendingRequestsForUser(
  userId: number
): Promise<FriendRequestRow[]> {
  const rows = await dbQuery<FriendRequestRow>(
    `SELECT id, requester_id, recipient_id, created_at
     FROM friend_requests
     WHERE recipient_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getSentRequestsForUser(
  userId: number
): Promise<FriendRequestRow[]> {
  const rows = await dbQuery<FriendRequestRow>(
    `SELECT id, requester_id, recipient_id, created_at
     FROM friend_requests
     WHERE requester_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * DAO: Friendships
 */

export async function createFriendship(
  userId1: number,
  userId2: number
): Promise<FriendshipRow> {
  // Ensure ordered pair for consistency
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  const rows = await dbQuery<FriendshipRow>(
    `INSERT INTO friendships (user_id_1, user_id_2, status)
     VALUES ($1, $2, 'accepted')
     RETURNING id, user_id_1, user_id_2, status, created_at, updated_at`,
    [smallerId, largerId]
  );
  return rows[0];
}

export async function getFriendship(
  userId1: number,
  userId2: number
): Promise<FriendshipRow | null> {
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  const rows = await dbQuery<FriendshipRow>(
    `SELECT id, user_id_1, user_id_2, status, created_at, updated_at
     FROM friendships
     WHERE user_id_1 = $1 AND user_id_2 = $2`,
    [smallerId, largerId]
  );
  return rows[0] || null;
}

export async function deleteFriendship(
  userId1: number,
  userId2: number
): Promise<void> {
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  await dbQuery(
    `DELETE FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2`,
    [smallerId, largerId]
  );
}

export async function updateFriendshipStatus(
  userId1: number,
  userId2: number,
  status: "pending" | "accepted" | "blocked"
): Promise<FriendshipRow> {
  const [smallerId, largerId] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  const rows = await dbQuery<FriendshipRow>(
    `UPDATE friendships
     SET status = $3, updated_at = NOW()
     WHERE user_id_1 = $1 AND user_id_2 = $2
     RETURNING id, user_id_1, user_id_2, status, created_at, updated_at`,
    [smallerId, largerId, status]
  );
  return rows[0];
}

/**
 * Get all accepted friends for a user
 */
export async function getAcceptedFriends(userId: number): Promise<number[]> {
  const rows = await dbQuery<{ friend_id: number }>(
    `SELECT
      CASE
        WHEN user_id_1 = $1 THEN user_id_2
        ELSE user_id_1
      END AS friend_id
     FROM friendships
     WHERE (user_id_1 = $1 OR user_id_2 = $1)
       AND status = 'accepted'`,
    [userId]
  );
  return rows.map((r) => r.friend_id);
}

/**
 * Get friend count for a user
 */
export async function getFriendCount(userId: number): Promise<number> {
  const rows = await dbQuery<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM friendships
     WHERE (user_id_1 = $1 OR user_id_2 = $1)
       AND status = 'accepted'`,
    [userId]
  );
  return parseInt(rows[0].count, 10);
}

/**
 * Get friends with user details (for friends list)
 */
export async function getFriendsWithDetails(
  userId: number
): Promise<FriendWithDetails[]> {
  const rows = await dbQuery<FriendWithDetails>(
    `SELECT
      CASE
        WHEN f.user_id_1 = $1 THEN f.user_id_2
        ELSE f.user_id_1
      END AS friend_id,
      p.display_name,
      p.bio,
      EXTRACT(YEAR FROM AGE(u.date_of_birth)) AS age,
      s.name AS school_name,
      s.short_name AS school_short_name,
      p.graduation_year,
      ph.url AS avatar_url,
      (
        SELECT COALESCE(
          array_agg(COALESCE(a.short_name, a.name) ORDER BY ord) FILTER (WHERE a.id IS NOT NULL),
          ARRAY[]::text[]
        )
        FROM unnest(COALESCE((p.featured_affiliations)[1:2], ARRAY[]::int[])) WITH ORDINALITY AS t(id, ord)
        LEFT JOIN affiliations a ON a.id = t.id
      ) AS featured_affiliation_short_names
     FROM friendships f
     JOIN users u ON u.id = CASE
       WHEN f.user_id_1 = $1 THEN f.user_id_2
       ELSE f.user_id_1
     END
     LEFT JOIN profiles p ON p.user_id = u.id
     LEFT JOIN schools s ON s.id = u.school_id
     LEFT JOIN photos ph ON ph.user_id = u.id AND ph.is_primary = TRUE
     WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
       AND f.status = 'accepted'
     ORDER BY p.display_name`,
    [userId]
  );
  return rows;
}

/**
 * Get pending friend requests with user details (for displaying in UI)
 */
export async function getPendingRequestsWithDetails(
  userId: number
): Promise<FriendRequestWithDetails[]> {
  const rows = await dbQuery<FriendRequestWithDetails>(
    `SELECT
      fr.id AS request_id,
      fr.requester_id,
      p.display_name,
      p.bio,
      EXTRACT(YEAR FROM AGE(u.date_of_birth)) AS age,
      s.name AS school_name,
      p.graduation_year,
      ph.url AS avatar_url,
      fr.created_at
     FROM friend_requests fr
     JOIN users u ON u.id = fr.requester_id
     LEFT JOIN profiles p ON p.user_id = u.id
     LEFT JOIN schools s ON s.id = u.school_id
     LEFT JOIN photos ph ON ph.user_id = u.id AND ph.is_primary = TRUE
     WHERE fr.recipient_id = $1
     ORDER BY fr.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Get affiliation short_name by ids (for friends list featured affiliations).
 */
export async function getAffiliationShortNamesByIds(
  ids: number[]
): Promise<Map<number, string>> {
  if (!ids.length) return new Map();
  const rows = await dbQuery<{ id: number; short_name: string | null; name: string }>(
    `SELECT id, short_name, name FROM affiliations WHERE id = ANY($1::int[])`,
    [ids]
  );
  const map = new Map<number, string>();
  for (const r of rows) {
    map.set(r.id, r.short_name ?? r.name ?? String(r.id));
  }
  return map;
}

/**
 * Check friendship status between two users
 * Returns: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked'
 */
export async function getFriendshipStatus(
  currentUserId: number,
  otherUserId: number
): Promise<string> {
  // Check for existing friendship
  const friendship = await getFriendship(currentUserId, otherUserId);
  if (friendship) {
    if (friendship.status === "accepted") return "friends";
    if (friendship.status === "blocked") return "blocked";
  }

  // Check for pending friend request
  const sentRequest = await getFriendRequest(currentUserId, otherUserId);
  if (sentRequest) return "pending_sent";

  const receivedRequest = await getFriendRequest(otherUserId, currentUserId);
  if (receivedRequest) return "pending_received";

  return "none";
}
