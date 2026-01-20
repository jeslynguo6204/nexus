/**
 * Profile Discovery & Ranking Logic
 * 
 * This file handles the complex logic for:
 * - Which profiles to show a user
 * - In what order profiles should appear in the discovery deck
 * 
 * For now, this uses hardcoded logic for testing purposes.
 * Later, this can be replaced with more sophisticated algorithms.
 */

import { FeedProfileRow } from './feed.dao';

export interface DiscoveryContext {
  userId: number;
  mode?: 'romantic' | 'platonic'; // Dating mode
  scope?: 'school' | 'league' | 'area'; // Discovery scope
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
 * Hardcoded profile ordering for testing
 * 
 * TODO: Replace this with actual ranking algorithm
 * 
 * Current hardcoded order (for testing):
 * 1. Profiles with photos (prioritized)
 * 2. Profiles from same school (if scope is 'school')
 * 3. Profiles with complete profiles (bio, major, etc.)
 * 4. Recently updated profiles
 * 
 * @param profiles - Array of profiles to rank
 * @param context - Discovery context (user info, mode, scope)
 * @returns Ranked and ordered array of profiles
 */
export function rankAndOrderProfiles(
  profiles: FeedProfileRow[],
  context: DiscoveryContext
): FeedProfileRow[] {
  // Hardcoded order by user_id (replace with actual user IDs you want to test)
  // For testing: Current user's profile will always appear first
  const hardcodedOrder: number[] = [14, 15, 25];
  
  // If hardcoded order is specified, use it
  if (hardcodedOrder.length > 0) {
    console.log('[Ranking] Using hardcoded order:', hardcodedOrder);
    console.log('[Ranking] Current user_id:', context.userId);
    console.log('[Ranking] Available profile user_ids:', profiles.map(p => p.user_id));
    
    const orderedProfiles: FeedProfileRow[] = [];
    const profileMap = new Map(profiles.map(p => [p.user_id, p]));
    
    // For testing: Always add current user's profile FIRST
    const currentUserProfile = profileMap.get(context.userId);
    if (currentUserProfile) {
      orderedProfiles.push(currentUserProfile);
      profileMap.delete(context.userId);
      console.log(`[Ranking] Added current user profile (user_id ${context.userId}) FIRST`);
    }
    
    // Add profiles in hardcoded order
    for (const userId of hardcodedOrder) {
      const profile = profileMap.get(userId);
      if (profile) {
        orderedProfiles.push(profile);
        profileMap.delete(userId);
        console.log(`[Ranking] Added profile with user_id ${userId} to ordered list`);
      } else {
        console.warn(`[Ranking] Profile with user_id ${userId} not found in available profiles`);
      }
    }
    
    // Add any remaining profiles that weren't in the hardcoded list
    profileMap.forEach(profile => {
      orderedProfiles.push(profile);
    });
    
    console.log('[Ranking] Final ordered profile user_ids:', orderedProfiles.map(p => p.user_id));
    
    return orderedProfiles;
  }
  
  // If no hardcoded order, still put current user first for testing
  const currentUserProfile = profiles.find(p => p.user_id === context.userId);
  const otherProfiles = profiles.filter(p => p.user_id !== context.userId);
  
  if (currentUserProfile) {
    return [currentUserProfile, ...otherProfiles];
  }
  
  return profiles;
  
  // Default ranking logic (when no hardcoded order is specified)
  return profiles.sort((a, b) => {
    // Priority 1: Profiles with photos
    const aHasPhotos = a.photos && a.photos.length > 0;
    const bHasPhotos = b.photos && b.photos.length > 0;
    if (aHasPhotos && !bHasPhotos) return -1;
    if (!aHasPhotos && bHasPhotos) return 1;
    
    // Priority 2: Same school (if scope is 'school')
    if (context.scope === 'school' && context.userProfile?.school_id) {
      const aSameSchool = a.school_id === context.userProfile.school_id;
      const bSameSchool = b.school_id === context.userProfile.school_id;
      if (aSameSchool && !bSameSchool) return -1;
      if (!aSameSchool && bSameSchool) return 1;
    }
    
    // Priority 3: Complete profiles (has bio and major)
    const aComplete = !!(a.bio && a.major);
    const bComplete = !!(b.bio && b.major);
    if (aComplete && !bComplete) return -1;
    if (!aComplete && bComplete) return 1;
    
    // Priority 4: Default to original order (by updated_at DESC from query)
    return 0;
  });
}

/**
 * Filter profiles based on discovery context
 * 
 * @param profiles - Array of profiles to filter
 * @param context - Discovery context
 * @returns Filtered array of profiles
 */
export function filterProfiles(
  profiles: FeedProfileRow[],
  context: DiscoveryContext
): FeedProfileRow[] {
  let filtered = [...profiles];
  
  // For testing: Include current user's profile (they want to see their own profile first)
  // TODO: In production, exclude the current user:
  // filtered = filtered.filter(p => p.user_id !== context.userId);
  
  // TODO: Add more filtering logic based on:
  // - Gender preferences (dating_gender_preference, friends_gender_preference)
  // - Age preferences (min_age_preference, max_age_preference)
  // - Distance preferences (max_distance_km)
  // - Mode (romantic vs platonic)
  // - Scope (school, league, area)
  // - Already swiped/matched users
  // - Blocked users
  
  return filtered;
}

/**
 * Main function to get discovery feed for a user
 * 
 * @param allProfiles - All available profiles from database
 * @param context - Discovery context
 * @returns Filtered, ranked, and ordered profiles ready for discovery deck
 */
export function getDiscoveryFeed(
  allProfiles: FeedProfileRow[],
  context: DiscoveryContext
): FeedProfileRow[] {
  // Step 1: Filter profiles
  const filtered = filterProfiles(allProfiles, context);
  
  // Step 2: Rank and order profiles
  const ranked = rankAndOrderProfiles(filtered, context);
  
  // Step 3: Apply limit (if needed)
  // For now, return all ranked profiles
  // Later: apply pagination or limit based on context
  
  return ranked;
}

