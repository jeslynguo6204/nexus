// mobile/api/profile.js
import Constants from "expo-constants";
import { authHeaders } from "../auth/tokens";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

export async function getMyProfile() {
  const API_BASE = getApiBase();
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/profiles/me`, {
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Failed to fetch profile");
  }

  return json.profile;
}

export async function updateMyProfile(fields) {
  const API_BASE = getApiBase();
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/profiles/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...headers,
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
