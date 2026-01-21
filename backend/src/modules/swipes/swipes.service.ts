// backend/src/modules/swipes/swipes.service.ts
import {
  createDatingLike,
  createDatingPass,
  getDatingLike,
  getDatingPass,
  checkMutualLike,
  createDatingMatch,
  getDatingMatch,
} from "./swipes.dao";

export async function recordLike(likerId: number, likeeId: number) {
  // Prevent self-likes
  if (likerId === likeeId) {
    const err = new Error("Cannot like yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  // Check if already liked
  const existingLike = await getDatingLike(likerId, likeeId);
  if (existingLike) {
    // Already liked - return existing like (idempotent)
    return {
      like: existingLike,
      isMatch: false,
      match: null,
    };
  }

  // Create the like
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

  // Check if already passed
  const existingPass = await getDatingPass(passerId, passeeId);
  if (existingPass) {
    // Already passed - return existing pass (idempotent)
    return existingPass;
  }

  // Create the pass
  const pass = await createDatingPass(passerId, passeeId);
  return pass;
}
