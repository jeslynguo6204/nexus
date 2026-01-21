// backend/src/modules/matches/matches.controller.ts
import { Request, Response, NextFunction } from "express";
import { getAllMatches, getChats } from "./matches.service";

export interface AuthedRequest extends Request {
  userId?: number;
}

export async function getAllMatchesController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const matches = await getAllMatches(req.userId!);
    res.status(200).json({ matches });
  } catch (error) {
    next(error);
  }
}

export async function getChatsController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chats = await getChats(req.userId!);
    res.status(200).json({ chats });
  } catch (error) {
    next(error);
  }
}
