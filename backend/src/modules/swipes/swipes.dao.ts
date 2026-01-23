// backend/src/modules/swipes/swipes.dao.ts
import { dbQuery } from "../../db/pool";

export type DatingLikeRow = {
  id: number;
  liker_id: number;
  likee_id: number;
  created_at: string;
};

export type DatingPassRow = {
  id: number;
  passer_id: number;
  passee_id: number;
  created_at: string;
};

export type DatingMatchRow = {
  id: number;
  matcher_id: number;
  matchee_id: number;
  channel_id: string;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  unmatched_at: string | null;
};

export async function createDatingLike(
  likerId: number,
  likeeId: number
): Promise<DatingLikeRow> {
  const rows = await dbQuery<DatingLikeRow>(
    `
    INSERT INTO dating_likes (liker_id, likee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (liker_id, likee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, liker_id, likee_id, created_at
    `,
    [likerId, likeeId]
  );
  return rows[0];
}

export async function createDatingPass(
  passerId: number,
  passeeId: number
): Promise<DatingPassRow> {
  const rows = await dbQuery<DatingPassRow>(
    `
    INSERT INTO dating_passes (passer_id, passee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (passer_id, passee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, passer_id, passee_id, created_at
    `,
    [passerId, passeeId]
  );
  return rows[0];
}

export async function getDatingLike(
  likerId: number,
  likeeId: number
): Promise<DatingLikeRow | null> {
  const rows = await dbQuery<DatingLikeRow>(
    `
    SELECT id, liker_id, likee_id, created_at
    FROM dating_likes
    WHERE liker_id = $1 AND likee_id = $2
    `,
    [likerId, likeeId]
  );
  return rows[0] ?? null;
}

export async function getDatingPass(
  passerId: number,
  passeeId: number
): Promise<DatingPassRow | null> {
  const rows = await dbQuery<DatingPassRow>(
    `
    SELECT id, passer_id, passee_id, created_at
    FROM dating_passes
    WHERE passer_id = $1 AND passee_id = $2
    `,
    [passerId, passeeId]
  );
  return rows[0] ?? null;
}

export async function checkMutualLike(
  userId1: number,
  userId2: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM dating_likes
      WHERE liker_id = $1 AND likee_id = $2
    ) AND EXISTS(
      SELECT 1 FROM dating_likes
      WHERE liker_id = $2 AND likee_id = $1
    ) AS exists
    `,
    [userId1, userId2]
  );
  return rows[0]?.exists ?? false;
}

export async function createDatingMatch(
  matcherId: number,
  matcheeId: number
): Promise<DatingMatchRow> {
  const rows = await dbQuery<DatingMatchRow>(
    `
    INSERT INTO dating_matches (matcher_id, matchee_id, is_active)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (matcher_id, matchee_id) DO NOTHING
    RETURNING id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    `,
    [matcherId, matcheeId]
  );
  return rows[0];
}

export async function getDatingMatch(
  userId1: number,
  userId2: number
): Promise<DatingMatchRow | null> {
  const rows = await dbQuery<DatingMatchRow>(
    `
    SELECT id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    FROM dating_matches
    WHERE (matcher_id = $1 AND matchee_id = $2) OR (matcher_id = $2 AND matchee_id = $1)
    `,
    [userId1, userId2]
  );
  return rows[0] ?? null;
}

// Friend mode functions (mirror dating mode)
export type FriendLikeRow = {
  id: number;
  liker_id: number;
  likee_id: number;
  created_at: string;
};

export type FriendPassRow = {
  id: number;
  passer_id: number;
  passee_id: number;
  created_at: string;
};

export type FriendMatchRow = {
  id: number;
  matcher_id: number;
  matchee_id: number;
  channel_id: string;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  unmatched_at: string | null;
};

export async function createFriendLike(
  likerId: number,
  likeeId: number
): Promise<FriendLikeRow> {
  const rows = await dbQuery<FriendLikeRow>(
    `
    INSERT INTO friend_likes (liker_id, likee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (liker_id, likee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, liker_id, likee_id, created_at
    `,
    [likerId, likeeId]
  );
  return rows[0];
}

export async function createFriendPass(
  passerId: number,
  passeeId: number
): Promise<FriendPassRow> {
  const rows = await dbQuery<FriendPassRow>(
    `
    INSERT INTO friend_passes (passer_id, passee_id, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (passer_id, passee_id) 
    DO UPDATE SET created_at = NOW()
    RETURNING id, passer_id, passee_id, created_at
    `,
    [passerId, passeeId]
  );
  return rows[0];
}

export async function getFriendLike(
  likerId: number,
  likeeId: number
): Promise<FriendLikeRow | null> {
  const rows = await dbQuery<FriendLikeRow>(
    `
    SELECT id, liker_id, likee_id, created_at
    FROM friend_likes
    WHERE liker_id = $1 AND likee_id = $2
    `,
    [likerId, likeeId]
  );
  return rows[0] ?? null;
}

export async function getFriendPass(
  passerId: number,
  passeeId: number
): Promise<FriendPassRow | null> {
  const rows = await dbQuery<FriendPassRow>(
    `
    SELECT id, passer_id, passee_id, created_at
    FROM friend_passes
    WHERE passer_id = $1 AND passee_id = $2
    `,
    [passerId, passeeId]
  );
  return rows[0] ?? null;
}

export async function checkMutualFriendLike(
  userId1: number,
  userId2: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM friend_likes
      WHERE liker_id = $1 AND likee_id = $2
    ) AND EXISTS(
      SELECT 1 FROM friend_likes
      WHERE liker_id = $2 AND likee_id = $1
    ) AS exists
    `,
    [userId1, userId2]
  );
  return rows[0]?.exists ?? false;
}

export async function createFriendMatch(
  matcherId: number,
  matcheeId: number
): Promise<FriendMatchRow> {
  const rows = await dbQuery<FriendMatchRow>(
    `
    INSERT INTO friend_matches (matcher_id, matchee_id, is_active)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (matcher_id, matchee_id) DO NOTHING
    RETURNING id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    `,
    [matcherId, matcheeId]
  );
  return rows[0];
}

export async function getFriendMatch(
  userId1: number,
  userId2: number
): Promise<FriendMatchRow | null> {
  const rows = await dbQuery<FriendMatchRow>(
    `
    SELECT id, matcher_id, matchee_id, channel_id, created_at, last_message_at, is_active, unmatched_at
    FROM friend_matches
    WHERE (matcher_id = $1 AND matchee_id = $2) OR (matcher_id = $2 AND matchee_id = $1)
    `,
    [userId1, userId2]
  );
  return rows[0] ?? null;
}
