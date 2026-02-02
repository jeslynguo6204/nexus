/**
 * feed.service.ts
 *
 * Responsibility: ORCHESTRATION
 * - Calls DAO to fetch eligible profiles (already filtered by gender/mode/scope/blocks)
 * - Builds context for ranking
 * - Applies ranking/ordering
 * - Shapes response for frontend
 *
 * Flow:
 * 1. Load viewer profile (safety check: must have gender)
 * 2. DAO returns ONLY eligible profiles (all filtering happens there)
 * 3. Build context for ordering logic
 * 4. Apply ranking/ordering
 * 5. Shape response with school info
 */

import * as FeedDao from "./feed.dao";
import { getDiscoveryFeed, DiscoveryContext } from "./feed.ranking";
import { getProfileByUserId } from "../profiles/profiles.dao";

export async function getFeedForUser(
  userId: number,
  options?: {
    mode?: "romantic" | "platonic";
    scope?: "school" | "league" | "area";
  }
) {
  const mode = options?.mode ?? "romantic";
  const scope = options?.scope ?? "school";

  // 1️⃣ Load viewer profile (needed for context + safety checks)
  const userProfile = await getProfileByUserId(userId);

  // Strict behavior: no gender → no feed
  // (DAO also enforces this, but this makes intent explicit)
  if (!userProfile?.gender) {
    return [];
  }

  // If viewer doesn't have the mode enabled, return empty feed
  if (mode === "romantic" && !userProfile.is_dating_enabled) {
    return [];
  }
  if (mode === "platonic" && !userProfile.is_friends_enabled) {
    return [];
  }

  // 2️⃣ DAO returns ONLY eligible profiles
  // (gender bidirectional logic now lives here)
  const eligibleProfiles = await FeedDao.getEligibleFeedProfiles(userId, {
    mode,
    scope,
    includeAllForTesting: false,
    // optional: pull a larger pool for future ranking
    limit: 50,
  });

  // 3️⃣ Build discovery context (used ONLY for ordering logic)
  const context: DiscoveryContext = {
    userId,
    mode,
    scope,
    userProfile: {
      school_id: userProfile.school_id ?? null,
      gender: userProfile.gender,
      dating_gender_preference: userProfile.dating_gender_preference,
      friends_gender_preference: userProfile.friends_gender_preference,
      min_age_preference: userProfile.min_age_preference,
      max_age_preference: userProfile.max_age_preference,
      max_distance_km: userProfile.max_distance_km,
    },
  };

  // 4️⃣ Ranking = ordering only (no filtering)
  const orderedProfiles = getDiscoveryFeed(eligibleProfiles, context);

  // 5️⃣ Shape response for frontend (explicit mutual_count so it is never dropped)
  return orderedProfiles.map((row) => ({
    ...row,
    mutual_count: row.mutual_count != null ? Number(row.mutual_count) : 0,
    school: {
      id: row.school_id,
      name: row.school_name,
      short_name: row.school_short_name,
    },
  }));
}
