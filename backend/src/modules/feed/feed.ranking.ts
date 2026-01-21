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
 * Check if a preference includes a specific gender
 * 
 * Examples:
 * - "everyone" includes all genders
 * - "male" includes "male"
 * - "female" includes "female"
 * - "non-binary" includes "non-binary"
 */
function preferenceIncludesGender(preference: string, gender: string): boolean {
  const pref = preference.toLowerCase().trim();
  const gen = gender.toLowerCase().trim();
  
  // "everyone" matches all genders
  if (pref === 'everyone') return true;
  
  // Exact match
  if (pref === gen) return true;
  
  // Handle non-binary
  if (pref === 'non-binary' && gen === 'non-binary') return true;
  
  return false;
}

/**
 * Check if gender preferences match bidirectionally
 * 
 * For dating mode: Requires strict bidirectional matching
 * - A woman who wants to see men should only see men who want to see women
 * - A man who wants to see women should only see women who want to see men
 * - If someone has "everyone" selected, they can be shown to anyone whose preference includes their gender
 *   (e.g., woman with "everyone" can be shown to men/women/non-binary who want women or "everyone")
 * 
 * @param userGender - Current user's gender
 * @param userPreference - Current user's gender preference
 * @param profileGender - Profile's gender
 * @param profilePreference - Profile's gender preference
 * @param mode - 'romantic' or 'platonic'
 * @returns true if preferences match bidirectionally
 */
function genderPreferencesMatch(
  userGender: string | null,
  userPreference: string | null,
  profileGender: string | null,
  profilePreference: string | null,
  mode: 'romantic' | 'platonic' = 'romantic'
): boolean {
  // If user or profile hasn't set gender, skip filtering (can't match without gender)
  if (!userGender || !profileGender) {
    return false;
  }
  
  // For romantic mode, require both preferences to be set for strict matching
  if (mode === 'romantic') {
    if (!userPreference || !profilePreference) {
      return false; // Require preferences to be set for dating
    }
  } else {
    // For platonic mode, be more lenient - allow if preferences aren't set
    if (!userPreference || !profilePreference) {
      return true;
    }
  }
  
  // Normalize to lowercase for comparison
  const userPref = userPreference.toLowerCase().trim();
  const profilePref = profilePreference.toLowerCase().trim();
  const userGen = userGender.toLowerCase().trim();
  const profileGen = profileGender.toLowerCase().trim();
  
  // Check bidirectional matching:
  // 1. User's preference includes profile's gender
  //    - If user has "everyone", they want to see all genders (including profile's gender)
  //    - If user has specific preference (e.g., "male"), check if it matches profile's gender
  // 2. Profile's preference includes user's gender
  //    - If profile has "everyone", they want to see all genders (including user's gender)
  //    - If profile has specific preference (e.g., "female"), check if it matches user's gender
  const userWantsProfile = preferenceIncludesGender(userPref, profileGen);
  const profileWantsUser = preferenceIncludesGender(profilePref, userGen);
  
  // Both must match for bidirectional compatibility
  return userWantsProfile && profileWantsUser;
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
  
  // Exclude current user
  filtered = filtered.filter(p => p.user_id !== context.userId);
  
  // Filter by gender preferences (bidirectional matching)
  // For dating mode: woman who wants men should only see men who want women (and vice versa)
  if (context.userProfile?.gender && context.mode) {
    const userGender = context.userProfile.gender;
    const userPreference = context.mode === 'romantic' 
      ? context.userProfile.dating_gender_preference
      : context.userProfile.friends_gender_preference;
    
    filtered = filtered.filter(profile => {
      const profilePreference = context.mode === 'romantic'
        ? profile.dating_gender_preference
        : profile.friends_gender_preference;
      
      return genderPreferencesMatch(
        userGender,
        userPreference || null,
        profile.gender,
        profilePreference || null,
        context.mode
      );
    });
  }
  
  // TODO: Add more filtering logic based on:
  // - Age preferences (min_age_preference, max_age_preference)
  // - Distance preferences (max_distance_km)
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

