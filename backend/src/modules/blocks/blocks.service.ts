// backend/src/modules/blocks/blocks.service.ts
import {
  createBlock,
  removeBlock,
  isBlocked,
  isEitherBlocked,
  getBlockedUsers,
  createReport,
  hasReported,
  BlockRow,
  ReportRow,
} from "./blocks.dao";

export async function blockUser(
  blockerId: number,
  blockedId: number
): Promise<BlockRow> {
  return await createBlock(blockerId, blockedId);
}

export async function unblockUser(
  blockerId: number,
  blockedId: number
): Promise<void> {
  return await removeBlock(blockerId, blockedId);
}

export async function checkIfBlocked(
  userId1: number,
  userId2: number
): Promise<boolean> {
  return await isEitherBlocked(userId1, userId2);
}

export async function getUserBlockedList(blockerId: number): Promise<number[]> {
  return await getBlockedUsers(blockerId);
}

export async function reportUser(
  reporterId: number,
  reportedId: number,
  reason: ReportRow['reason'],
  details?: string | null
): Promise<ReportRow> {
  // Check if already reported (optional - you might want to allow multiple reports)
  // For now, we'll allow multiple reports but you can uncomment this if needed:
  // const alreadyReported = await hasReported(reporterId, reportedId);
  // if (alreadyReported) {
  //   const err = new Error("You have already reported this user");
  //   (err as any).statusCode = 400;
  //   throw err;
  // }

  return await createReport(reporterId, reportedId, reason, details);
}

