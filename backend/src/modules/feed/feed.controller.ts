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
  } catch (err: any) {
    console.error("=== FEED CONTROLLER ERROR ===");
    console.error("Error:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    if (err.originalError) {
      console.error("Original error:", err.originalError);
    }
    console.error("============================");
    return res.status(500).json({ 
      error: "Failed to load feed", 
      details: err.message || String(err),
      originalError: err.originalError?.message
    });
  }
}
