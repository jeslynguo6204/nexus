// mobile/api/feedAPI.js
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';

export async function getFeedProfiles(token, mode = 'romantic', scope = 'school') {
  const params = new URLSearchParams();
  if (mode) params.append('mode', mode);
  if (scope) params.append('scope', scope);
  
  const queryString = params.toString();
  const url = `${API_BASE}/feed${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('Feed API error response:', json);
    const error = new Error(json.details || json.error || `HTTP ${res.status}: ${res.statusText}`);
    error.response = res;
    throw error;
  }

  return json.profiles || [];
}
