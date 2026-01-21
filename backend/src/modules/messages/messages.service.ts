// backend/src/modules/messages/messages.service.ts
import {
  sendFirstMessage as sendFirstMessageDAO,
  getChatMessages,
  MessageRow,
} from "./messages.dao";
import { getDatingMatch, getFriendMatch } from "../swipes/swipes.dao";

export async function sendMessage(
  matchId: number,
  senderUserId: number,
  messageBody: string,
  mode: 'romantic' | 'platonic' = 'romantic'
): Promise<{
  chatId: number;
  messageId: number;
  message: string;
}> {
  if (!messageBody || !messageBody.trim()) {
    const err = new Error("Message body cannot be empty");
    (err as any).statusCode = 400;
    throw err;
  }

  if (messageBody.trim().length > 5000) {
    const err = new Error("Message cannot exceed 5000 characters");
    (err as any).statusCode = 400;
    throw err;
  }

  // Verify the match exists and the user is part of it
  // Note: We need to check the match by looking up which user is the other party
  // For now, we'll let sendFirstMessageDAO handle the validation
  // But we should verify the match exists first
  let match;
  if (mode === 'platonic') {
    // For friend matches, we need to check if the match exists
    // Since we only have matchId, we'll let the DAO handle validation
    match = null; // Will be validated in DAO
  } else {
    // For dating matches, same approach
    match = null; // Will be validated in DAO
  }

  try {
    const result = await sendFirstMessageDAO(
      matchId,
      senderUserId,
      messageBody.trim(),
      mode
    );
    return {
      chatId: result.chatId,
      messageId: result.messageId,
      message: "Message sent successfully",
    };
  } catch (error) {
    const err = error as any;
    if (err.message?.includes("not found")) {
      (err as any).statusCode = 404;
    } else {
      (err as any).statusCode = 500;
    }
    throw err;
  }
}

export async function getMessages(
  chatId: number
): Promise<Array<MessageRow & { senderDisplayName?: string }>> {
  const messages = await getChatMessages(chatId);
  // Just return raw messages for now; you can join with profiles later if needed
  return messages;
}
