// src/modules/profiles/profiles.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthedRequest } from "../../middleware/authMiddleware";
import * as ProfileService from "./profiles.service";
import { ProfileUpdateBody } from "./profiles.validation";
import { runAgeUpdateJob } from "./profiles.cron";

export async function getMe(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const profile = await ProfileService.getMyProfile(req.userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function getUserProfile(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const otherUserId = Number(req.params.userId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const profile = await ProfileService.getUserProfile(req.userId, otherUserId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const body = req.body as ProfileUpdateBody;

    const updated = await ProfileService.updateMyProfile(req.userId, body);

    if (!updated) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin endpoint to manually trigger age update for users with birthdays today
 * This can be called manually or scheduled via cron
 */
export async function updateAges(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runAgeUpdateJob();
    
    if (result.success) {
      return res.json({ 
        message: `Successfully updated ages for ${result.updatedCount} users`,
        updatedCount: result.updatedCount 
      });
    } else {
      return res.status(500).json({ 
        error: result.error || 'Failed to update ages',
        updatedCount: result.updatedCount 
      });
    }
  } catch (err) {
    next(err);
  }
}
