// backend/src/modules/messages/messages.dao.ts
import { pool, dbQuery } from "../../db/pool";

export type ChatRow = {
  id: number;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
};

export type MessageRow = {
  id: number;
  chat_id: number;
  sender_user_id: number;
  body: string;
  created_at: string;
};

export async function createChat(): Promise<ChatRow> {
  const rows = await dbQuery<ChatRow>(
    `
    INSERT INTO chats (created_at, last_message_at, last_message_preview)
    VALUES (NOW(), NULL, NULL)
    RETURNING id, created_at, last_message_at, last_message_preview
    `,
    []
  );
  return rows[0];
}

export async function getChat(chatId: number): Promise<ChatRow | null> {
  const rows = await dbQuery<ChatRow>(
    `
    SELECT id, created_at, last_message_at, last_message_preview
    FROM chats
    WHERE id = $1
    `,
    [chatId]
  );
  return rows[0] ?? null;
}

export async function updateChatPreview(
  chatId: number,
  preview: string
): Promise<ChatRow> {
  const rows = await dbQuery<ChatRow>(
    `
    UPDATE chats
    SET last_message_at = NOW(),
        last_message_preview = $1
    WHERE id = $2
    RETURNING id, created_at, last_message_at, last_message_preview
    `,
    [preview, chatId]
  );
  return rows[0];
}

export async function createMessage(
  chatId: number,
  senderUserId: number,
  body: string
): Promise<MessageRow> {
  const rows = await dbQuery<MessageRow>(
    `
    INSERT INTO messages (chat_id, sender_user_id, body, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, chat_id, sender_user_id, body, created_at
    `,
    [chatId, senderUserId, body]
  );
  return rows[0];
}

/**
 * Send first message: atomically create chat (if needed), update match, and insert message
 * Uses database-level locking to prevent race conditions
 */
export async function sendFirstMessage(
  matchId: number,
  senderUserId: number,
  messageBody: string,
  mode: 'romantic' | 'platonic' = 'romantic'
): Promise<{ chatId: number; messageId: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const matchTable = mode === 'platonic' ? 'friend_matches' : 'dating_matches';

    // Lock the match row and check if chat_id exists
    const matchResult = await client.query(
      `
      SELECT id, chat_id, matcher_id, matchee_id
      FROM ${matchTable}
      WHERE id = $1
      FOR UPDATE
      `,
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      throw new Error("Match not found");
    }

    const match = matchResult.rows[0];
    let chatId = match.chat_id;

    const chatsTable = mode === 'platonic' ? 'friend_chats' : 'chats';
    const messagesTable = mode === 'platonic' ? 'friend_messages' : 'messages';

    // If no chat_id yet, create one and update the match
    if (!chatId) {
      const chatResult = await client.query(
        `
        INSERT INTO ${chatsTable} (created_at, last_message_at, last_message_preview)
        VALUES (NOW(), NULL, NULL)
        RETURNING id
        `
      );
      chatId = chatResult.rows[0].id;

      // Update the match with the new chat_id
      await client.query(
        `
        UPDATE ${matchTable}
        SET chat_id = $1
        WHERE id = $2
        `,
        [chatId, matchId]
      );
    }

    // Insert the message
    const messageResult = await client.query(
      `
      INSERT INTO ${messagesTable} (chat_id, sender_user_id, body, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
      `,
      [chatId, senderUserId, messageBody]
    );

    const messageId = messageResult.rows[0].id;

    // Update chat preview
    const preview = messageBody.substring(0, 120);
    await client.query(
      `
      UPDATE ${chatsTable}
      SET last_message_at = NOW(),
          last_message_preview = $1
      WHERE id = $2
      `,
      [preview, chatId]
    );

    await client.query("COMMIT");
    return { chatId, messageId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get chat messages in reverse order (newest first)
 */
export async function getChatMessages(
  chatId: number,
  limit: number = 50,
  mode: 'romantic' | 'platonic' = 'romantic'
): Promise<MessageRow[]> {
  const messagesTable = mode === 'platonic' ? 'friend_messages' : 'messages';
  const rows = await dbQuery<MessageRow>(
    `
    SELECT id, chat_id, sender_user_id, body, created_at
    FROM ${messagesTable}
    WHERE chat_id = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [chatId, limit]
  );
  return rows;
}
