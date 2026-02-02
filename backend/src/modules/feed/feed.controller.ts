import { Response } from "express";
import { AuthedRequest } from "../../middleware/authMiddleware";
import * as FeedService from "./feed.service";

export async function getFeed(req: AuthedRequest, res: Response) {
  try {
    const userId = req.userId!;

    const modeQ = req.query.mode;
    const scopeQ = req.query.scope;

    const mode =
      modeQ === "romantic" || modeQ === "platonic" ? modeQ : undefined;

    const scope =
      scopeQ === "school" || scopeQ === "league" || scopeQ === "area"
        ? scopeQ
        : undefined;

    const profiles = await FeedService.getFeedForUser(userId, { mode, scope });

    if (profiles.length > 0) {
      const first = profiles[0] as Record<string, unknown>;
      console.log("[Feed] first profile mutual_count:", first?.mutual_count, "keys:", Object.keys(first || {}).filter((k) => k.includes("mutual")));
    }

    return res.json({ profiles });
  } catch (err: any) {
    console.error("=== FEED CONTROLLER ERROR ===");
    console.error("Error:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    if (err.originalError) console.error("Original error:", err.originalError);
    console.error("============================");

    return res.status(500).json({
      error: "Failed to load feed",
      details: err.message || String(err),
      originalError: err.originalError?.message,
    });
  }
}
