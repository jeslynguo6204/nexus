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

    const result = await sendMessage(parseInt(matchId), userId, body);
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
    const messages = await getMessages(parseInt(chatId));
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}
