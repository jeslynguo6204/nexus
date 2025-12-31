import { Response } from "express";
import { AuthedRequest } from "../../middleware/authMiddleware";
import * as FeedService from "./feed.service";

export async function getFeed(req: AuthedRequest, res: Response) {
  try {
    const userId = req.userId!;
    
    // Optional query parameters for testing different discovery modes/scopes
    const mode = req.query.mode as 'romantic' | 'platonic' | undefined;
    const scope = req.query.scope as 'school' | 'league' | 'area' | undefined;
    
    const profiles = await FeedService.getFeedForUser(userId, {
      mode,
      scope,
    });

    return res.json({ profiles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load feed" });
  }
}
