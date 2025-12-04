import { Response } from "express";
import { AuthedRequest } from "../../middleware/authMiddleware";
import * as FeedService from "./feed.service";

export async function getFeed(req: AuthedRequest, res: Response) {
  try {
    const userId = req.userId!;
    const profiles = await FeedService.getFeedForUser(userId);

    return res.json({ profiles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load feed" });
  }
}
