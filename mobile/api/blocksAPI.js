// mobile/api/blocksAPI.js

import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

// Block a user
export async function blockUser(token, userId) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/blocks/block/${userId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to block user");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Error blocking user:", error);
    throw error;
  }
}

// Unblock a user
export async function unblockUser(token, userId) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/blocks/unblock/${userId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to unblock user");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Error unblocking user:", error);
    throw error;
  }
}

// Check if user is blocked
export async function checkIfBlocked(token, userId) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/blocks/check/${userId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to check block status");
    }

    const data = await res.json();
    return data.isBlocked;
  } catch (error) {
    console.warn("Error checking block status:", error);
    throw error;
  }
}

// Get list of blocked users
export async function getBlockedList(token) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/blocks/list`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to get blocked list");
    }

    const data = await res.json();
    return data.blockedUsers || [];
  } catch (error) {
    console.warn("Error getting blocked list:", error);
    throw error;
  }
}

// Report a user
export async function reportUser(token, userId, reason, details) {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/blocks/report/${userId}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason,
        details: details || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to report user");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Error reporting user:", error);
    throw error;
  }
}

