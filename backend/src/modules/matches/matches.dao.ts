// backend/src/modules/matches/matches.dao.ts
import { dbQuery, pool } from "../../db/pool";

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

export async function getMatchByIdForUser(
  matchId: number,
  userId: number,
  mode: 'romantic' | 'platonic' = 'romantic'
): Promise<MatchRow | null> {
  const matchTable = mode === 'platonic' ? 'friend_matches' : 'dating_matches';
  const rows = await dbQuery<MatchRow>(
    `
    SELECT id, matcher_id, matchee_id, chat_id, created_at, last_message_at, is_active, unmatched_at
    FROM ${matchTable}
    WHERE id = $1 AND (matcher_id = $2 OR matchee_id = $2) AND is_active = TRUE AND unmatched_at IS NULL
    `,
    [matchId, userId]
  );
  return rows[0] ?? null;
}

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
  userId: number,
  mode: 'romantic' | 'platonic' = 'romantic'
): Promise<MatchWithUserRow[]> {
  const matchesTable = mode === 'platonic' ? 'friend_matches' : 'dating_matches';
  const chatsTable = mode === 'platonic' ? 'friend_chats' : 'chats';
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
    FROM ${matchesTable} dm
    JOIN ${chatsTable} c ON c.id = dm.chat_id
    LEFT JOIN profiles p1 ON p1.user_id = dm.matcher_id
    LEFT JOIN profiles p2 ON p2.user_id = dm.matchee_id
    LEFT JOIN photos ph1 ON ph1.user_id = dm.matcher_id AND ph1.is_primary = TRUE
    LEFT JOIN photos ph2 ON ph2.user_id = dm.matchee_id AND ph2.is_primary = TRUE
    WHERE (dm.matcher_id = $1 OR dm.matchee_id = $1)
      AND dm.is_active = TRUE
      AND dm.unmatched_at IS NULL
      AND c.last_message_at IS NOT NULL
      AND c.last_message_at >= NOW() - INTERVAL '30 days'
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

/**
 * Unmatch with a user - deletes the match from dating_matches table
 * Also deletes the associated chat, all messages, and both likes from dating_likes table
 */
export async function unmatchUser(userId: number, matchId: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the match and verify it belongs to the user
    const matchResult = await client.query(
      `
      SELECT id, matcher_id, matchee_id, chat_id
      FROM dating_matches
      WHERE id = $1 AND (matcher_id = $2 OR matchee_id = $2) AND is_active = TRUE AND unmatched_at IS NULL
      FOR UPDATE
      `,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      throw new Error("Match not found or already unmatched");
    }

    const match = matchResult.rows[0];
    const chatId = match.chat_id;
    
    // Ensure userId is a number for comparison
    const userIdNum = Number(userId);
    const otherUserId = match.matcher_id === userIdNum ? match.matchee_id : match.matcher_id;
    
    console.log(`[Unmatch] Match record:`, match);
    console.log(`[Unmatch] Unmatching dating mode - userId: ${userIdNum}, matchId: ${matchId}, otherUserId: ${otherUserId}`);

    // Delete likes in both directions FIRST (user A liked user B, and user B liked user A)
    const likesResult = await client.query(
      `
      DELETE FROM dating_likes
      WHERE (liker_id = $1 AND likee_id = $2) OR (liker_id = $2 AND likee_id = $1)
      `,
      [userIdNum, otherUserId]
    );

    console.log(`[Unmatch] Deleted ${likesResult.rowCount} likes rows from dating_likes`);

    // Delete chat and messages if chat exists (before deleting match due to foreign key constraints)
    // Use dating mode tables: chats and messages
    if (chatId) {
      // Delete messages first (foreign key constraint)
      await client.query(
        `
        DELETE FROM messages
        WHERE chat_id = $1
        `,
        [chatId]
      );

      // Delete chat
      await client.query(
        `
        DELETE FROM chats
        WHERE id = $1
        `,
        [chatId]
      );
    }

    // Delete the match from dating_matches table
    const matchDeleteResult = await client.query(
      `
      DELETE FROM dating_matches
      WHERE id = $1
      `,
      [matchId]
    );

    console.log(`[Unmatch] Deleted match row from dating_matches. Rows deleted: ${matchDeleteResult.rowCount}`);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`[Unmatch] Error during unmatch:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Friend mode functions (mirror dating mode)
/**
 * Get all friend matches for a user (even if no chat started yet)
 */
export async function getAllFriendMatchesForUser(
  userId: number
): Promise<MatchWithUserRow[]> {
  const rows = await dbQuery<MatchWithUserRow>(
    `
    SELECT 
      fm.id,
      fm.matcher_id,
      fm.matchee_id,
      fm.chat_id,
      fm.created_at,
      fm.last_message_at,
      fm.is_active,
      fm.unmatched_at,
      CASE 
        WHEN fm.matcher_id = $1 THEN p2.user_id
        ELSE p1.user_id
      END as match_user_id,
      CASE 
        WHEN fm.matcher_id = $1 THEN p2.display_name
        ELSE p1.display_name
      END as display_name,
      CASE 
        WHEN fm.matcher_id = $1 THEN ph2.url
        ELSE ph1.url
      END as avatar_url,
      NULL::text as last_message_preview
    FROM friend_matches fm
    LEFT JOIN profiles p1 ON p1.user_id = fm.matcher_id
    LEFT JOIN profiles p2 ON p2.user_id = fm.matchee_id
    LEFT JOIN photos ph1 ON ph1.user_id = fm.matcher_id AND ph1.is_primary = TRUE
    LEFT JOIN photos ph2 ON ph2.user_id = fm.matchee_id AND ph2.is_primary = TRUE
    WHERE (fm.matcher_id = $1 OR fm.matchee_id = $1) AND fm.is_active = TRUE AND fm.unmatched_at IS NULL
    ORDER BY fm.created_at DESC
    `,
    [userId]
  );
  return rows;
}

/**
 * Get active friend chat matches for a user (only matches where a message has been sent)
 */
export async function getActiveFriendChatMatches(
  userId: number
): Promise<MatchWithUserRow[]> {
  const rows = await dbQuery<MatchWithUserRow>(
    `
    SELECT 
      fm.id,
      fm.matcher_id,
      fm.matchee_id,
      fm.chat_id,
      fm.created_at,
      fm.last_message_at,
      fm.is_active,
      fm.unmatched_at,
      CASE 
        WHEN fm.matcher_id = $1 THEN p2.user_id
        ELSE p1.user_id
      END as match_user_id,
      CASE 
        WHEN fm.matcher_id = $1 THEN p2.display_name
        ELSE p1.display_name
      END as display_name,
      CASE 
        WHEN fm.matcher_id = $1 THEN ph2.url
        ELSE ph1.url
      END as avatar_url,
      c.last_message_preview
    FROM friend_matches fm
    JOIN friend_chats c ON c.id = fm.chat_id
    LEFT JOIN profiles p1 ON p1.user_id = fm.matcher_id
    LEFT JOIN profiles p2 ON p2.user_id = fm.matchee_id
    LEFT JOIN photos ph1 ON ph1.user_id = fm.matcher_id AND ph1.is_primary = TRUE
    LEFT JOIN photos ph2 ON ph2.user_id = fm.matchee_id AND ph2.is_primary = TRUE
    WHERE (fm.matcher_id = $1 OR fm.matchee_id = $1) AND fm.is_active = TRUE AND fm.unmatched_at IS NULL
    ORDER BY c.last_message_at DESC NULLS LAST
    `,
    [userId]
  );
  return rows;
}

export async function getFriendMatch(userId: number, otherUserId: number): Promise<MatchRow | null> {
  const rows = await dbQuery<MatchRow>(
    `
    SELECT id, matcher_id, matchee_id, chat_id, created_at, last_message_at, is_active, unmatched_at
    FROM friend_matches
    WHERE (matcher_id = $1 AND matchee_id = $2) OR (matcher_id = $2 AND matchee_id = $1)
    `,
    [userId, otherUserId]
  );
  return rows[0] ?? null;
}

/**
 * Unmatch with a user in friend mode - deletes the match from friend_matches table
 * Also deletes the associated chat, all messages, and both likes from friend_likes table
 */
export async function unmatchFriendUser(userId: number, matchId: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the match and verify it belongs to the user
    const matchResult = await client.query(
      `
      SELECT id, matcher_id, matchee_id, chat_id
      FROM friend_matches
      WHERE id = $1 AND (matcher_id = $2 OR matchee_id = $2) AND is_active = TRUE AND unmatched_at IS NULL
      FOR UPDATE
      `,
      [matchId, userId]
    );

    if (matchResult.rows.length === 0) {
      throw new Error("Match not found or already unmatched");
    }

    const match = matchResult.rows[0];
    const chatId = match.chat_id;
    
    // Ensure userId is a number for comparison
    const userIdNum = Number(userId);
    const otherUserId = match.matcher_id === userIdNum ? match.matchee_id : match.matcher_id;
    
    console.log(`[Unmatch] Match record:`, match);
    console.log(`[Unmatch] Unmatching friend mode - userId: ${userIdNum}, matchId: ${matchId}, otherUserId: ${otherUserId}`);

    // Delete likes in both directions FIRST (user A liked user B, and user B liked user A)
    const likesResult = await client.query(
      `
      DELETE FROM friend_likes
      WHERE (liker_id = $1 AND likee_id = $2) OR (liker_id = $2 AND likee_id = $1)
      `,
      [userIdNum, otherUserId]
    );

    console.log(`[Unmatch] Deleted ${likesResult.rowCount} likes rows from friend_likes`);

    // Delete chat and messages if chat exists (before deleting match due to foreign key constraints)
    // Use friend mode tables: friend_chats and friend_messages
    if (chatId) {
      // Delete messages first (foreign key constraint)
      await client.query(
        `
        DELETE FROM friend_messages
        WHERE chat_id = $1
        `,
        [chatId]
      );

      // Delete chat
      await client.query(
        `
        DELETE FROM friend_chats
        WHERE id = $1
        `,
        [chatId]
      );
    }

    // Delete the match from friend_matches table
    const matchDeleteResult = await client.query(
      `
      DELETE FROM friend_matches
      WHERE id = $1
      `,
      [matchId]
    );

    console.log(`[Unmatch] Deleted match row from friend_matches. Rows deleted: ${matchDeleteResult.rowCount}`);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`[Unmatch] Error during unmatch:`, error);
    throw error;
  } finally {
    client.release();
  }
}
