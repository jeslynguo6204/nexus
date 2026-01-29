// backend/src/modules/swipes/swipes.service.ts
import { dbQuery } from "../../db/pool";
import {
  createDatingLike,
  createDatingPass,
  getDatingLike,
  getDatingPass,
  checkMutualLike,
  createDatingMatch,
  getDatingMatch,
  createFriendLike,
  createFriendPass,
  getFriendLike,
  getFriendPass,
  checkMutualFriendLike,
  createFriendMatch,
  getFriendMatch,
  getReceivedLikesProfiles,
} from "./swipes.dao";

export async function recordLike(likerId: number, likeeId: number) {
  // Prevent self-likes
  if (likerId === likeeId) {
    const err = new Error("Cannot like yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  // If user previously passed on this person, delete the pass (replacing old interaction)
  const existingPass = await getDatingPass(likerId, likeeId);
  if (existingPass) {
    // Delete the old pass record - we're replacing it with a like
    await dbQuery(
      `DELETE FROM dating_passes WHERE passer_id = $1 AND passee_id = $2`,
      [likerId, likeeId]
    );
  }

  // Create or update the like (will update timestamp if already exists)
  const like = await createDatingLike(likerId, likeeId);

  // Check for mutual like (match)
  const isMatch = await checkMutualLike(likerId, likeeId);

  let match = null;
  if (isMatch) {
    // Check if match already exists
    const existingMatch = await getDatingMatch(likerId, likeeId);
    
    if (!existingMatch) {
      // Create a new match
      match = await createDatingMatch(likerId, likeeId);
    } else {
      match = existingMatch;
    }
  }

  return {
    like,
    isMatch,
    match,
  };
}

export async function recordPass(passerId: number, passeeId: number) {
  // Prevent self-passes
  if (passerId === passeeId) {
    const err = new Error("Cannot pass on yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  // If user previously liked this person, delete the like (replacing old interaction)
  const existingLike = await getDatingLike(passerId, passeeId);
  if (existingLike) {
    // Delete the old like record - we're replacing it with a pass
    await dbQuery(
      `DELETE FROM dating_likes WHERE liker_id = $1 AND likee_id = $2`,
      [passerId, passeeId]
    );
  }

  // Create or update the pass (will update timestamp if already exists)
  const pass = await createDatingPass(passerId, passeeId);
  return pass;
}

export async function recordFriendLike(likerId: number, likeeId: number) {
  // Prevent self-likes
  if (likerId === likeeId) {
    const err = new Error("Cannot like yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  // If user previously passed on this person, delete the pass (replacing old interaction)
  const existingPass = await getFriendPass(likerId, likeeId);
  if (existingPass) {
    // Delete the old pass record - we're replacing it with a like
    await dbQuery(
      `DELETE FROM friend_passes WHERE passer_id = $1 AND passee_id = $2`,
      [likerId, likeeId]
    );
  }

  // Create or update the like (will update timestamp if already exists)
  const like = await createFriendLike(likerId, likeeId);

  // Check for mutual like (match)
  const isMatch = await checkMutualFriendLike(likerId, likeeId);

  let match = null;
  if (isMatch) {
    // Check if match already exists
    const existingMatch = await getFriendMatch(likerId, likeeId);
    
    if (!existingMatch) {
      // Create a new match
      match = await createFriendMatch(likerId, likeeId);
    } else {
      match = existingMatch;
    }
  }

  return {
    like,
    isMatch,
    match,
  };
}

export async function recordFriendPass(passerId: number, passeeId: number) {
  // Prevent self-passes
  if (passerId === passeeId) {
    const err = new Error("Cannot pass on yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  // If user previously liked this person, delete the like (replacing old interaction)
  const existingLike = await getFriendLike(passerId, passeeId);
  if (existingLike) {
    // Delete the old like record - we're replacing it with a pass
    await dbQuery(
      `DELETE FROM friend_likes WHERE liker_id = $1 AND likee_id = $2`,
      [passerId, passeeId]
    );
  }

  // Create or update the pass (will update timestamp if already exists)
  const pass = await createFriendPass(passerId, passeeId);
  return pass;
}

export async function getReceivedLikes(userId: number, mode: 'romantic' | 'platonic' = 'romantic') {
  const profiles = await getReceivedLikesProfiles(userId, mode);
  return profiles;
}
