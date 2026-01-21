// backend/src/modules/swipes/swipes.controller.ts
import type { Response } from "express";
import type { AuthedRequest } from "../../middleware/authMiddleware";

import { recordLike, recordPass } from "./swipes.service";

export async function likeUserController(req: AuthedRequest, res: Response) {
  try {
    const likeeId = Number(req.params.userId);
    if (isNaN(likeeId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await recordLike(req.userId!, likeeId);
    
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

    const pass = await recordPass(req.userId!, passeeId);
    
    res.json({
      success: true,
      pass,
    });
  } catch (err: any) {
    console.error("POST /swipes/pass/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
