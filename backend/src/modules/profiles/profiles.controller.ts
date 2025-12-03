import { Request, Response, NextFunction } from "express";
import { AuthedRequest } from "../../middleware/auth";
import * as ProfileService from "./profiles.service";

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

    const {
      displayName,
      bio,
      major,
      graduationYear,
      isDatingEnabled,
      isFriendsEnabled,
      datingGenderPreference,
      friendsGenderPreference,
      minAgePreference,
      maxAgePreference,
      maxDistanceKm,
      showMeInDiscovery,
    } = req.body;

    const updated = await ProfileService.updateMyProfile(req.userId, {
      displayName,
      bio,
      major,
      graduationYear,
      isDatingEnabled,
      isFriendsEnabled,
      datingGenderPreference,
      friendsGenderPreference,
      minAgePreference,
      maxAgePreference,
      maxDistanceKm,
      showMeInDiscovery,
    });

    if (!updated) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile: updated });
  } catch (err) {
    next(err);
  }
}