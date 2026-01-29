// backend/src/modules/swipes/swipes.controller.ts
import type { Response } from "express";
import type { AuthedRequest } from "../../middleware/authMiddleware";

import { recordLike, recordPass, recordFriendLike, recordFriendPass, getReceivedLikes } from "./swipes.service";

export async function likeUserController(req: AuthedRequest, res: Response) {
  try {
    const likeeId = Number(req.params.userId);
    if (isNaN(likeeId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Get mode from query parameter (default to 'romantic' for backward compatibility)
    const mode = (req.query.mode as string) || 'romantic';

    let result;
    if (mode === 'platonic') {
      result = await recordFriendLike(req.userId!, likeeId);
    } else {
      result = await recordLike(req.userId!, likeeId);
    }
    
    res.json({
      success: true,
      isMatch: result.isMatch,
      like: result.like,
      match: result.match,
    });
  } catch (err: any) {
    console.error("POST /swipes/like/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function passUserController(req: AuthedRequest, res: Response) {
  try {
    const passeeId = Number(req.params.userId);
    if (isNaN(passeeId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    // Get mode from query parameter (default to 'romantic' for backward compatibility)
    const mode = (req.query.mode as string) || 'romantic';

    let pass;
    if (mode === 'platonic') {
      pass = await recordFriendPass(req.userId!, passeeId);
    } else {
      pass = await recordPass(req.userId!, passeeId);
    }
    
    res.json({
      success: true,
      pass,
    });
  } catch (err: any) {
    console.error("POST /swipes/pass/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getReceivedLikesController(req: AuthedRequest, res: Response) {
  try {
    const mode = (req.query.mode as string) || 'romantic';
    const validMode = mode === 'platonic' ? 'platonic' : 'romantic';

    const profiles = await getReceivedLikes(req.userId!, validMode);
    
    res.json({
      success: true,
      profiles,
    });
  } catch (err: any) {
    console.error("GET /swipes/received error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
