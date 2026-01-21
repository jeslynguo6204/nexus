// backend/src/modules/blocks/blocks.controller.ts
import type { Response } from "express";
import type { AuthedRequest } from "../../middleware/authMiddleware";
import {
  blockUser,
  unblockUser,
  checkIfBlocked,
  getUserBlockedList,
  reportUser,
} from "./blocks.service";

export async function blockUserController(req: AuthedRequest, res: Response) {
  try {
    const blockedId = Number(req.params.userId);
    if (isNaN(blockedId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const block = await blockUser(req.userId!, blockedId);
    res.json({
      success: true,
      block,
    });
  } catch (err: any) {
    console.error("POST /blocks/block/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function unblockUserController(req: AuthedRequest, res: Response) {
  try {
    const blockedId = Number(req.params.userId);
    if (isNaN(blockedId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    await unblockUser(req.userId!, blockedId);
    res.json({
      success: true,
      message: "User unblocked successfully",
    });
  } catch (err: any) {
    console.error("POST /blocks/unblock/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function checkBlockedController(req: AuthedRequest, res: Response) {
  try {
    const otherUserId = Number(req.params.userId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const isBlocked = await checkIfBlocked(req.userId!, otherUserId);
    res.json({
      isBlocked,
    });
  } catch (err: any) {
    console.error("GET /blocks/check/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getBlockedListController(req: AuthedRequest, res: Response) {
  try {
    const blockedIds = await getUserBlockedList(req.userId!);
    res.json({
      blockedUsers: blockedIds,
    });
  } catch (err: any) {
    console.error("GET /blocks/list error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function reportUserController(req: AuthedRequest, res: Response) {
  try {
    const reportedId = Number(req.params.userId);
    if (isNaN(reportedId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const { reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    const validReasons = [
      'spam',
      'harassment',
      'inappropriate_content',
      'fake_profile',
      'impersonation',
      'stalking',
      'hate_speech',
      'scam',
      'violated_terms',
      'other'
    ];

    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: "Invalid reason" });
    }

    const report = await reportUser(
      req.userId!,
      reportedId,
      reason,
      details || null
    );

    res.json({
      success: true,
      report,
    });
  } catch (err: any) {
    console.error("POST /blocks/report/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

