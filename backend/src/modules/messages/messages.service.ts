// backend/src/modules/messages/messages.service.ts
import {
  sendFirstMessage as sendFirstMessageDAO,
  getChatMessages,
  MessageRow,
} from "./messages.dao";
import { getDatingMatch } from "../swipes/swipes.dao";

export async function sendMessage(
  matchId: number,
  senderUserId: number,
  messageBody: string
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
  const match = await getDatingMatch(senderUserId, matchId);
  if (!match) {
    const err = new Error("Match not found or user not part of this match");
    (err as any).statusCode = 404;
    throw err;
  }

  try {
    const result = await sendFirstMessageDAO(
      matchId,
      senderUserId,
      messageBody.trim()
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
