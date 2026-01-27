import { pool } from "../../db/pool";
import {
  createFriendRequest,
  deleteFriendRequest,
  getFriendRequest,
  getPendingRequestsForUser,
  getPendingRequestsWithDetails,
  getSentRequestsForUser,
  createFriendship,
  getFriendship,
  deleteFriendship,
  getAcceptedFriends,
  getFriendCount,
  getFriendsWithDetails,
  getFriendshipStatus,
  FriendRequestRow,
  FriendWithDetails,
  FriendRequestWithDetails,
} from "./friends.dao";

/**
 * Send a friend request
 * Business logic:
 * - Can't send request to yourself
 * - Can't send duplicate requests
 * - Can't send request if already friends
 * - Can't send request if you have a pending request from them (should accept instead)
 */
export async function sendFriendRequest(
  requesterId: number,
  recipientId: number
): Promise<FriendRequestRow> {
  // Validate: can't friend yourself
  if (requesterId === recipientId) {
    const err = new Error("Cannot send friend request to yourself");
    (err as any).statusCode = 400;
    throw err;
  }

  // Check if already friends
  const existingFriendship = await getFriendship(requesterId, recipientId);
  if (existingFriendship && existingFriendship.status === "accepted") {
    const err = new Error("You are already friends with this user");
    (err as any).statusCode = 400;
    throw err;
  }

  // Check if request already sent
  const existingRequest = await getFriendRequest(requesterId, recipientId);
  if (existingRequest) {
    const err = new Error("Friend request already sent");
    (err as any).statusCode = 400;
    throw err;
  }

  // Check if they already sent you a request (should accept instead)
  const incomingRequest = await getFriendRequest(recipientId, requesterId);
  if (incomingRequest) {
    const err = new Error(
      "This user has already sent you a friend request. Please accept their request instead."
    );
    (err as any).statusCode = 400;
    throw err;
  }

  // Create the friend request
  return await createFriendRequest(requesterId, recipientId);
}

/**
 * Accept a friend request
 * Business logic:
 * - Creates friendship with 'accepted' status
 * - Deletes the friend request
 * - Uses transaction to ensure atomicity
 */
export async function acceptFriendRequest(
  currentUserId: number,
  requesterId: number
): Promise<{ message: string }> {
  // Verify the request exists and is for the current user
  const request = await getFriendRequest(requesterId, currentUserId);
  if (!request) {
    const err = new Error("Friend request not found");
    (err as any).statusCode = 404;
    throw err;
  }

  // Use transaction to create friendship and delete request atomically
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create friendship
    await client.query(
      `INSERT INTO friendships (user_id_1, user_id_2, status)
       VALUES (
         LEAST($1::integer, $2::integer),
         GREATEST($1::integer, $2::integer),
         'accepted'
       )
       ON CONFLICT (user_id_1, user_id_2)
       DO UPDATE SET status = 'accepted', updated_at = NOW()`,
      [requesterId, currentUserId]
    );

    // Delete friend request
    await client.query(
      `DELETE FROM friend_requests
       WHERE requester_id = $1 AND recipient_id = $2`,
      [requesterId, currentUserId]
    );

    await client.query("COMMIT");

    return { message: "Friend request accepted" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Decline a friend request
 * Simply deletes the request
 */
export async function declineFriendRequest(
  currentUserId: number,
  requesterId: number
): Promise<{ message: string }> {
  // Verify the request exists
  const request = await getFriendRequest(requesterId, currentUserId);
  if (!request) {
    const err = new Error("Friend request not found");
    (err as any).statusCode = 404;
    throw err;
  }

  await deleteFriendRequest(requesterId, currentUserId);
  return { message: "Friend request declined" };
}

/**
 * Cancel a sent friend request
 */
export async function cancelFriendRequest(
  currentUserId: number,
  recipientId: number
): Promise<{ message: string }> {
  // Verify the request exists
  const request = await getFriendRequest(currentUserId, recipientId);
  if (!request) {
    const err = new Error("Friend request not found");
    (err as any).statusCode = 404;
    throw err;
  }

  await deleteFriendRequest(currentUserId, recipientId);
  return { message: "Friend request cancelled" };
}

/**
 * Remove a friend
 * Deletes the friendship record
 */
export async function removeFriend(
  currentUserId: number,
  friendId: number
): Promise<{ message: string }> {
  // Verify friendship exists
  const friendship = await getFriendship(currentUserId, friendId);
  if (!friendship || friendship.status !== "accepted") {
    const err = new Error("You are not friends with this user");
    (err as any).statusCode = 404;
    throw err;
  }

  await deleteFriendship(currentUserId, friendId);
  return { message: "Friend removed" };
}

/**
 * Get list of pending friend requests (received)
 */
export async function getPendingRequests(
  userId: number
): Promise<FriendRequestRow[]> {
  return await getPendingRequestsForUser(userId);
}

/**
 * Get list of pending friend requests with user details (for UI display)
 */
export async function getPendingRequestsDetailed(
  userId: number
): Promise<FriendRequestWithDetails[]> {
  return await getPendingRequestsWithDetails(userId);
}

/**
 * Get list of sent friend requests
 */
export async function getSentRequests(userId: number): Promise<FriendRequestRow[]> {
  return await getSentRequestsForUser(userId);
}

/**
 * Get friend list with details
 */
export async function getFriendsList(userId: number): Promise<FriendWithDetails[]> {
  return await getFriendsWithDetails(userId);
}

/**
 * Get friend count for a user
 */
export async function getUserFriendCount(userId: number): Promise<number> {
  return await getFriendCount(userId);
}

/**
 * Get friendship status between current user and another user
 */
export async function checkFriendshipStatus(
  currentUserId: number,
  otherUserId: number
): Promise<{ status: string }> {
  const status = await getFriendshipStatus(currentUserId, otherUserId);
  return { status };
}
