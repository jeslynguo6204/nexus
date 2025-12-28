// mobile/api/feedAPI.js
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';

export async function getFeedProfiles(token) {
  const res = await fetch(`${API_BASE}/feed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch profiles');
  }

  return json.profiles || [];
}
