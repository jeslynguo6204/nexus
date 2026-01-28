import { Response } from "express";
import { AuthedRequest } from "../../middleware/authMiddleware";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getPendingRequests,
  getPendingRequestsDetailed,
  getSentRequests,
  getFriendsList,
  getUserFriendCount,
  checkFriendshipStatus,
} from "./friends.service";

/**
 * POST /friends/request/:userId
 * Send a friend request to another user
 */
export async function sendFriendRequestController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const recipientId = Number(req.params.userId);
    if (isNaN(recipientId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const request = await sendFriendRequest(req.userId!, recipientId);
    res.status(201).json({ success: true, request });
  } catch (err: any) {
    console.error("POST /friends/request/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /friends/accept/:userId
 * Accept a friend request from another user
 */
export async function acceptFriendRequestController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const requesterId = Number(req.params.userId);
    if (isNaN(requesterId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await acceptFriendRequest(req.userId!, requesterId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST /friends/accept/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * POST /friends/decline/:userId
 * Decline a friend request from another user
 */
export async function declineFriendRequestController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const requesterId = Number(req.params.userId);
    if (isNaN(requesterId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await declineFriendRequest(req.userId!, requesterId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST /friends/decline/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * DELETE /friends/request/:userId
 * Cancel a sent friend request
 */
export async function cancelFriendRequestController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const recipientId = Number(req.params.userId);
    if (isNaN(recipientId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await cancelFriendRequest(req.userId!, recipientId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("DELETE /friends/request/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * DELETE /friends/:userId
 * Remove a friend
 */
export async function removeFriendController(req: AuthedRequest, res: Response) {
  try {
    const friendId = Number(req.params.userId);
    if (isNaN(friendId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await removeFriend(req.userId!, friendId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("DELETE /friends/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /friends/requests/pending
 * Get all pending friend requests (received)
 */
export async function getPendingRequestsController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const requests = await getPendingRequests(req.userId!);
    res.json({ requests });
  } catch (err: any) {
    console.error("GET /friends/requests/pending error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /friends/requests/pending/detailed
 * Get all pending friend requests with user details (for UI display)
 */
export async function getPendingRequestsDetailedController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const requests = await getPendingRequestsDetailed(req.userId!);
    res.json({ requests });
  } catch (err: any) {
    console.error("GET /friends/requests/pending/detailed error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /friends/requests/sent
 * Get all sent friend requests
 */
export async function getSentRequestsController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const requests = await getSentRequests(req.userId!);
    res.json({ requests });
  } catch (err: any) {
    console.error("GET /friends/requests/sent error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /friends/list
 * Get list of friends with details
 */
export async function getFriendsListController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const friends = await getFriendsList(req.userId!);
    res.json({ friends });
  } catch (err: any) {
    console.error("GET /friends/list error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /friends/count
 * Get friend count for current user
 */
export async function getFriendCountController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const count = await getUserFriendCount(req.userId!);
    res.json({ count });
  } catch (err: any) {
    console.error("GET /friends/count error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * GET /friends/status/:userId
 * Check friendship status with another user
 */
export async function checkFriendshipStatusController(
  req: AuthedRequest,
  res: Response
) {
  try {
    const otherUserId = Number(req.params.userId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const result = await checkFriendshipStatus(req.userId!, otherUserId);
    res.json(result);
  } catch (err: any) {
    console.error("GET /friends/status/:userId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
