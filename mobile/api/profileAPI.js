// mobile/api/profile.js
import Constants from "expo-constants";

const API_BASE = Constants.expoConfig.extra.apiBaseUrl;

console.log("📡 Profile API Base URL:", API_BASE);

export async function getMyProfile(token) {
  const res = await fetch(`${API_BASE}/profiles/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch profile");
  }

  return json.profile;
}

export async function updateMyProfile(token, fields) {
  const res = await fetch(`${API_BASE}/profiles/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Update failed");
  }

  return json.profile;
}
