import Constants from "expo-constants";

const API_BASE = Constants.expoConfig.extra.apiBaseUrl;

console.log("📡 API Base URL:", API_BASE);

async function request(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || 'Something went wrong');
  }

  return json;
}

export function login({ email, password }) {
  return request('/auth/login', { email, password });
}

export function signup({ fullName, email, password, dateOfBirth, gender }) {
  return request('/auth/signup', {
    fullName,
    email,
    password,
    dateOfBirth,
    gender,
  });
}
