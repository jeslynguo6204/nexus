// mobile/api/photos.js

// For Expo Go on a real device, replace localhost with your laptop's LAN IP,
// e.g. "http://192.168.1.23:4000"
// const API_BASE =
//   process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

import Constants from "expo-constants";

const API_BASE = Constants.expoConfig.extra.apiBaseUrl;

console.log("📡 API Base URL:", API_BASE);
  
export async function fetchMyPhotos(token) {
  const res = await fetch(`${API_BASE}/photos/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load photos");
  }

  const data = await res.json();
  // data.photos is an array of { id, user_id, url, sort_order, is_primary, created_at }
  return data.photos || [];
}

export async function addPhoto(token, url) {
  const res = await fetch(`${API_BASE}/photos/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }), // can be a data URI
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add photo");
  }

  const data = await res.json();
  return data.photo; // { id, user_id, url, ... }
}

export async function deletePhoto(token, photoId) {
  const res = await fetch(`${API_BASE}/photos/me/${photoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete photo");
  }

  return true;
}
