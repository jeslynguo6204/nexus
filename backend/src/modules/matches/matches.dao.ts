// backend/src/modules/matches/matches.dao.ts
import { dbQuery } from "../../db/pool";

export type MatchRow = {
  id: number;
  matcher_id: number;
  matchee_id: number;
  chat_id: number | null;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  unmatched_at: string | null;
};

export type MatchWithUserRow = MatchRow & {
  match_user_id: number;
  display_name: string;
  avatar_url: string | null;
  last_message_preview: string | null;
};

/**
 * Get all matches for a user (even if no chat started yet)
 * Used for the top row of the inbox - shows all potential conversations
 */
export async function getAllMatchesForUser(
  userId: number
): Promise<MatchWithUserRow[]> {
  const rows = await dbQuery<MatchWithUserRow>(
    `
    SELECT 
      dm.id,
      dm.matcher_id,
      dm.matchee_id,
      dm.chat_id,
      dm.created_at,
      dm.last_message_at,
      dm.is_active,
      dm.unmatched_at,
      CASE 
        WHEN dm.matcher_id = $1 THEN p2.user_id
        ELSE p1.user_id
      END as match_user_id,
      CASE 
        WHEN dm.matcher_id = $1 THEN p2.display_name
        ELSE p1.display_name
      END as display_name,
      CASE 
        WHEN dm.matcher_id = $1 THEN ph2.url
        ELSE ph1.url
      END as avatar_url,
      NULL::text as last_message_preview
    FROM dating_matches dm
    LEFT JOIN profiles p1 ON p1.user_id = dm.matcher_id
    LEFT JOIN profiles p2 ON p2.user_id = dm.matchee_id
    LEFT JOIN photos ph1 ON ph1.user_id = dm.matcher_id AND ph1.is_primary = TRUE
    LEFT JOIN photos ph2 ON ph2.user_id = dm.matchee_id AND ph2.is_primary = TRUE
    WHERE (dm.matcher_id = $1 OR dm.matchee_id = $1) AND dm.is_active = TRUE AND dm.unmatched_at IS NULL
    ORDER BY dm.created_at DESC
    `,
    [userId]
  );
  return rows;
}

/**
 * Get active chat matches for a user (only matches where a message has been sent)
 * Used for the message list in the inbox - shows conversations with messages
 */
export async function getActiveChatMatches(
  userId: number
): Promise<MatchWithUserRow[]> {
  const rows = await dbQuery<MatchWithUserRow>(
    `
    SELECT 
      dm.id,
      dm.matcher_id,
      dm.matchee_id,
      dm.chat_id,
      dm.created_at,
      dm.last_message_at,
      dm.is_active,
      dm.unmatched_at,
      CASE 
        WHEN dm.matcher_id = $1 THEN p2.user_id
        ELSE p1.user_id
      END as match_user_id,
      CASE 
        WHEN dm.matcher_id = $1 THEN p2.display_name
        ELSE p1.display_name
      END as display_name,
      CASE 
        WHEN dm.matcher_id = $1 THEN ph2.url
        ELSE ph1.url
      END as avatar_url,
      c.last_message_preview
    FROM dating_matches dm
    JOIN chats c ON c.id = dm.chat_id
    LEFT JOIN profiles p1 ON p1.user_id = dm.matcher_id
    LEFT JOIN profiles p2 ON p2.user_id = dm.matchee_id
    LEFT JOIN photos ph1 ON ph1.user_id = dm.matcher_id AND ph1.is_primary = TRUE
    LEFT JOIN photos ph2 ON ph2.user_id = dm.matchee_id AND ph2.is_primary = TRUE
    WHERE (dm.matcher_id = $1 OR dm.matchee_id = $1) AND dm.is_active = TRUE AND dm.unmatched_at IS NULL
    ORDER BY c.last_message_at DESC NULLS LAST
    `,
    [userId]
  );
  return rows;
}

export async function getMatch(userId: number, otherUserId: number): Promise<MatchRow | null> {
  const rows = await dbQuery<MatchRow>(
    `
    SELECT id, matcher_id, matchee_id, chat_id, created_at, last_message_at, is_active, unmatched_at
    FROM dating_matches
    WHERE (matcher_id = $1 AND matchee_id = $2) OR (matcher_id = $2 AND matchee_id = $1)
    `,
    [userId, otherUserId]
  );
  return rows[0] ?? null;
}
