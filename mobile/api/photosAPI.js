// mobile/api/photos.js

// For Expo Go on a real device, replace localhost with your laptop's LAN IP,
// e.g. "http://192.168.1.23:4000"
// const API_BASE =
//   process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";

import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};
  
export async function fetchMyPhotos(token) {
  const API_BASE = getApiBase();
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
  const API_BASE = getApiBase();
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
  const API_BASE = getApiBase();
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

export async function reorderPhotos(token, order) {
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/photos/me/reorder`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to reorder photos");
  }

  return true;
}

// Track when a photo is viewed
export async function trackPhotoView(token, photoId) {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/photos/${photoId}/view`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`Failed to track photo view for photo ${photoId}`);
    }
  } catch (error) {
    // Fail silently - don't disrupt user experience
    console.warn('Error tracking photo view:', error);
  }
}

// Track when a photo is liked (swipe right)
export async function trackPhotoLike(token, photoId) {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/photos/${photoId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`Failed to track photo like for photo ${photoId}`);
    }
  } catch (error) {
    // Fail silently - don't disrupt user experience
    console.warn('Error tracking photo like:', error);
  }
}

// Track when a photo is passed (swipe left)
export async function trackPhotoPass(token, photoId) {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/photos/${photoId}/pass`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`Failed to track photo pass for photo ${photoId}`);
    }
  } catch (error) {
    // Fail silently - don't disrupt user experience
    console.warn('Error tracking photo pass:', error);
  }
}
