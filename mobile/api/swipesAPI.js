// mobile/api/swipesAPI.js

import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

// Record a like (swipe right)
export async function likeUser(token, userId, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/swipes/like/${userId}?mode=${mode}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to record like");
    }

    const data = await res.json();
    return data; // { success: true, isMatch: boolean, like: {...} }
  } catch (error) {
    console.warn("Error recording like:", error);
    throw error;
  }
}

// Record a pass (swipe left)
export async function passUser(token, userId, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/swipes/pass/${userId}?mode=${mode}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to record pass");
    }

    const data = await res.json();
    return data; // { success: true, pass: {...} }
  } catch (error) {
    console.warn("Error recording pass:", error);
    throw error;
  }
}

// Get profiles that have liked you (received likes)
export async function getReceivedLikes(token, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/swipes/received?mode=${mode}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch received likes");
    }

    const data = await res.json();
    return data.profiles || []; // Array of profile objects
  } catch (error) {
    console.warn("Error fetching received likes:", error);
    throw error;
  }
}
