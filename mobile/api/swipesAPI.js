// mobile/api/swipesAPI.js

import Constants from "expo-constants";

const API_BASE = Constants.expoConfig.extra.apiBaseUrl;

console.log("📡 Swipes API Base URL:", API_BASE);

// Record a like (swipe right)
export async function likeUser(token, userId) {
  try {
    const res = await fetch(`${API_BASE}/swipes/like/${userId}`, {
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
export async function passUser(token, userId) {
  try {
    const res = await fetch(`${API_BASE}/swipes/pass/${userId}`, {
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
