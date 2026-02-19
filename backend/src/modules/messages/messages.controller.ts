// backend/src/modules/messages/messages.controller.ts
import { Request, Response, NextFunction } from "express";
import { sendMessage, getMessages, markMessagesAsRead, getUnreadConversationsCount } from "./messages.service";
import { getIO } from "../../realtime/socket";
import { getMatchByIdForUser } from "../matches/matches.dao";

export interface AuthedRequest extends Request {
  userId?: number;
}

export async function sendMessageController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { matchId } = req.params;
    const { body } = req.body;
    // Get mode from query parameter (default to 'romantic' for backward compatibility)
    const mode = ((req.query.mode as string) || 'romantic') as 'romantic' | 'platonic';

    const result = await sendMessage(parseInt(matchId), userId, body, mode);

    // Notify recipient's personal room so BottomTabs badge updates
    const io = getIO();
    if (io) {
      const match = await getMatchByIdForUser(parseInt(matchId), userId, mode);
      if (match) {
        const recipientId = match.matcher_id === userId ? match.matchee_id : match.matcher_id;
        io.to(`user:${recipientId}`).emit("new_message_notification", {
          chatId: result.chatId,
          matchId: parseInt(matchId),
          senderId: userId,
        });
      }
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMessagesController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { chatId } = req.params;
    // Get mode from query parameter (default to 'romantic' for backward compatibility)
    const mode = ((req.query.mode as string) || 'romantic') as 'romantic' | 'platonic';
    const messages = await getMessages(parseInt(chatId), mode);
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

export async function markMessagesAsReadController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const { chatId } = req.params;
    const mode = ((req.query.mode as string) || 'romantic') as 'romantic' | 'platonic';

    const result = await markMessagesAsRead(parseInt(chatId), userId, mode);

    // Emit socket event to notify message senders that their messages were read
    const io = getIO();
    if (io && result.senderIds.length > 0) {
      result.senderIds.forEach((senderId) => {
        io.to(`user:${senderId}`).emit('messages_read', {
          chatId: parseInt(chatId),
          readBy: userId,
        });
      });
    }

    res.status(200).json({ markedCount: result.markedCount });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadConversationsCountController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const result = await getUnreadConversationsCount(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
