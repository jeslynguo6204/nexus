import * as FeedDao from "./feed.dao";
import { getDiscoveryFeed, DiscoveryContext } from "./feed.ranking";
import { getProfileByUserId } from "../profiles/profiles.dao";

export async function getFeedForUser(
  userId: number,
  options?: {
    mode?: 'romantic' | 'platonic';
    scope?: 'school' | 'league' | 'area';
  }
) {
  const mode = options?.mode || 'romantic';
  const scope = options?.scope || 'school';
  
  // Fetch profiles with school and mode filtering already applied
  const allProfiles = await FeedDao.getSimpleFeed(userId, {
    mode,
    scope,
    includeAllForTesting: false,
  });
  
  // Get user's profile for context (preferences, school, etc.)
  const userProfile = await getProfileByUserId(userId);
  
  // Build discovery context
  const context: DiscoveryContext = {
    userId,
    mode,
    scope,
    userProfile: userProfile ? {
      school_id: userProfile.school_id || null,
      gender: userProfile.gender,
      dating_gender_preference: userProfile.dating_gender_preference,
      friends_gender_preference: userProfile.friends_gender_preference,
      min_age_preference: userProfile.min_age_preference,
      max_age_preference: userProfile.max_age_preference,
      max_distance_km: userProfile.max_distance_km,
    } : undefined,
  };
  
  // Apply discovery logic (gender preference filtering, ranking, ordering)
  const discoveryProfiles = getDiscoveryFeed(allProfiles, context);

  // Shape school object for frontend consumers
  return discoveryProfiles.map((row) => ({
    ...row,
    school: {
      id: row.school_id,
      name: row.school_name,
      short_name: row.school_short_name,
    },
  }));
}
