import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

/**
 * Send a friend request to another user
 * @param {string} token - Auth token
 * @param {number} userId - Target user ID
 * @returns {Promise<{success: boolean, request: object}>}
 */
export async function sendFriendRequest(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/request/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to send friend request");
  return json;
}

/**
 * Accept a friend request
 * @param {string} token - Auth token
 * @param {number} userId - Requester user ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function acceptFriendRequest(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/accept/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to accept friend request");
  return json;
}

/**
 * Decline a friend request
 * @param {string} token - Auth token
 * @param {number} userId - Requester user ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function declineFriendRequest(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/decline/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to decline friend request");
  return json;
}

/**
 * Cancel a sent friend request
 * @param {string} token - Auth token
 * @param {number} userId - Recipient user ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function cancelFriendRequest(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/request/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to cancel friend request");
  return json;
}

/**
 * Remove a friend
 * @param {string} token - Auth token
 * @param {number} userId - Friend user ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function removeFriend(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to remove friend");
  return json;
}

/**
 * Get list of friends with details
 * @param {string} token - Auth token
 * @returns {Promise<Array<{friend_id: number, display_name: string, bio: string, age: number, school_name: string, graduation_year: number, avatar_url: string}>>}
 */
export async function getFriendsList(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get friends list");
  return json.friends;
}

/**
 * Get mutual friends list with another user
 * @param {string} token - Auth token
 * @param {number} userId - Other user ID
 * @returns {Promise<{count: number, mutuals: Array}>}
 */
export async function getMutualFriends(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/mutuals/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get mutual friends");
  return json;
}

/**
 * Get friend count for current user
 * @param {string} token - Auth token
 * @returns {Promise<{count: number}>}
 */
export async function getFriendCount(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get friend count");
  return json.count;
}

/**
 * Get pending friend requests (received)
 * @param {string} token - Auth token
 * @returns {Promise<Array<{id: number, requester_id: number, recipient_id: number, created_at: string}>>}
 */
export async function getPendingFriendRequests(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/requests/pending`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get pending requests");
  return json.requests;
}

/**
 * Get pending friend requests with user details (received)
 * @param {string} token - Auth token
 * @returns {Promise<Array<{request_id: number, requester_id: number, display_name: string, bio: string, age: number, school_name: string, graduation_year: number, avatar_url: string, created_at: string}>>}
 */
export async function getPendingFriendRequestsDetailed(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/requests/pending/detailed`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get pending requests");
  return json.requests;
}

/**
 * Get sent friend requests
 * @param {string} token - Auth token
 * @returns {Promise<Array<{id: number, requester_id: number, recipient_id: number, created_at: string}>>}
 */
export async function getSentFriendRequests(token) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/requests/sent`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to get sent requests");
  return json.requests;
}

/**
 * Check friendship status with another user
 * @param {string} token - Auth token
 * @param {number} userId - Other user ID
 * @returns {Promise<{status: string}>} - Status: 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'blocked'
 */
export async function checkFriendshipStatus(token, userId) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/friends/status/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to check friendship status");
  return json.status;
}
