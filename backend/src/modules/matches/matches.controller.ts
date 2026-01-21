// backend/src/modules/matches/matches.controller.ts
import { Request, Response, NextFunction } from "express";
import { getAllMatches, getChats, unmatch } from "./matches.service";

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

export async function unmatchController(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const matchId = Number(req.params.matchId);
    if (isNaN(matchId)) {
      res.status(400).json({ error: "Invalid matchId" });
      return;
    }

    await unmatch(req.userId!, matchId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Unmatch error:", error);
    res.status(error.statusCode || 500).json({ error: error.message || "Failed to unmatch" });
  }
}
