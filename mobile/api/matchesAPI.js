// mobile/api/matchesAPI.js

import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

export async function getAllMatches(token, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/matches/all?mode=${mode}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch matches");
    }

    const data = await res.json();
    return data.matches || [];
  } catch (error) {
    console.warn("Error fetching all matches:", error);
    throw error;
  }
}

export async function getChats(token, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/matches/chats?mode=${mode}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch chats");
    }

    const data = await res.json();
    return data.chats || [];
  } catch (error) {
    console.warn("Error fetching chats:", error);
    throw error;
  }
}

export async function unmatchUser(token, matchId, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/matches/${matchId}?mode=${mode}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to unmatch");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Error unmatching user:", error);
    throw error;
  }
}
