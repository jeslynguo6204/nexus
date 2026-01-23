/**
 * feed.ranking.ts
 *
 * Responsibility: ORDERING ONLY
 * - Takes already-eligible profiles from DAO
 * - Reorders by algorithm (trending, matching score, etc.)
 * - Does NOT filter
 */

import { FeedProfileRow } from "./feed.dao";

export interface DiscoveryContext {
  userId: number;
  mode?: "romantic" | "platonic";
  scope?: "school" | "league" | "area";
  userProfile?: {
    school_id: number | null;
    gender: string | null;
    dating_gender_preference?: string | null;
    friends_gender_preference?: string | null;
    min_age_preference?: number | null;
    max_age_preference?: number | null;
    max_distance_km?: number | null;
  };
}

/**
 * Reorder eligible profiles by ranking algorithm.
 * Current: keep DB order (by updated_at DESC)
 * Future: trending, matching score, etc.
 *
 * @param profiles Already-eligible profiles from DAO
 * @param context Discovery context for ranking decisions
 * @returns Reordered profiles (same count, no filtering)
 */
export function rankAndOrderProfiles(
  profiles: FeedProfileRow[],
  _context: DiscoveryContext
): FeedProfileRow[] {
  // For now keep DB order (updated_at DESC)
  return profiles;
}

export function getDiscoveryFeed(
  eligibleProfiles: FeedProfileRow[],
  context: DiscoveryContext
): FeedProfileRow[] {
  return rankAndOrderProfiles(eligibleProfiles, context);
}
