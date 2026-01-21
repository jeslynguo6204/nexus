// mobile/api/profile.js
import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

export async function getMyProfile(token) {
  const API_BASE = getApiBase();
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
  const API_BASE = getApiBase();
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
    // Log full error details for debugging
    console.error('Profile update error:', JSON.stringify(json, null, 2));
    console.error('Request body sent:', JSON.stringify(fields, null, 2));
    throw new Error(json.error || json.details?.fieldErrors || "Update failed");
  }

  return json.profile;
}
