// src/modules/profiles/profiles.controller.ts
import { Response, NextFunction } from "express";
import { AuthedRequest } from "../../middleware/auth";
import * as ProfileService from "./profiles.service";
import { ProfileUpdateBody } from "./profiles.validation";

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
