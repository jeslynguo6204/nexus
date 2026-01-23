// backend/src/modules/messages/messages.controller.ts
import { Request, Response, NextFunction } from "express";
import { sendMessage, getMessages } from "./messages.service";

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
