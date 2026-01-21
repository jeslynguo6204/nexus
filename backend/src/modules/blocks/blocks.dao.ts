// backend/src/modules/blocks/blocks.dao.ts
import { dbQuery } from "../../db/pool";

export type BlockRow = {
  id: number;
  blocker_id: number;
  blocked_id: number;
  is_active: boolean;
};

export type ReportRow = {
  id: number;
  reporter_id: number;
  reported_id: number;
  created_at: string;
  updated_at: string | null;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'impersonation' | 'stalking' | 'hate_speech' | 'scam' | 'violated_terms' | 'other';
  details: string | null;
};

// Block a user
export async function createBlock(
  blockerId: number,
  blockedId: number
): Promise<BlockRow> {
  // Prevent self-blocking
  if (blockerId === blockedId) {
    const err = new Error("Cannot block yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  const rows = await dbQuery<BlockRow>(
    `
    INSERT INTO blocks (blocker_id, blocked_id, is_active)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (blocker_id, blocked_id) 
    DO UPDATE SET is_active = TRUE
    RETURNING id, blocker_id, blocked_id, is_active
    `,
    [blockerId, blockedId]
  );
  return rows[0];
}

// Unblock a user
export async function removeBlock(
  blockerId: number,
  blockedId: number
): Promise<void> {
  await dbQuery(
    `
    UPDATE blocks 
    SET is_active = FALSE
    WHERE blocker_id = $1 AND blocked_id = $2
    `,
    [blockerId, blockedId]
  );
}

// Check if user is blocked
export async function isBlocked(
  blockerId: number,
  blockedId: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM blocks
      WHERE blocker_id = $1 
        AND blocked_id = $2 
        AND is_active = TRUE
    ) as exists
    `,
    [blockerId, blockedId]
  );
  return rows[0]?.exists || false;
}

// Check if either user has blocked the other (bidirectional check)
export async function isEitherBlocked(
  userId1: number,
  userId2: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM blocks
      WHERE (
        (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)
      )
      AND is_active = TRUE
    ) as exists
    `,
    [userId1, userId2]
  );
  return rows[0]?.exists || false;
}

// Get all users blocked by a user
export async function getBlockedUsers(blockerId: number): Promise<number[]> {
  const rows = await dbQuery<{ blocked_id: number }>(
    `
    SELECT blocked_id
    FROM blocks
    WHERE blocker_id = $1 AND is_active = TRUE
    `,
    [blockerId]
  );
  return rows.map(row => row.blocked_id);
}

// Create a report
export async function createReport(
  reporterId: number,
  reportedId: number,
  reason: ReportRow['reason'],
  details?: string | null
): Promise<ReportRow> {
  // Prevent self-reporting
  if (reporterId === reportedId) {
    const err = new Error("Cannot report yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  const rows = await dbQuery<ReportRow>(
    `
    INSERT INTO reports (reporter_id, reported_id, reason, details, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id, reporter_id, reported_id, created_at, updated_at, reason, details
    `,
    [reporterId, reportedId, reason, details || null]
  );
  return rows[0];
}

// Check if user has already reported another user
export async function hasReported(
  reporterId: number,
  reportedId: number
): Promise<boolean> {
  const rows = await dbQuery<{ exists: boolean }>(
    `
    SELECT EXISTS(
      SELECT 1 FROM reports
      WHERE reporter_id = $1 AND reported_id = $2
    ) as exists
    `,
    [reporterId, reportedId]
  );
  return rows[0]?.exists || false;
}

