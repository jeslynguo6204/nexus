import Constants from "expo-constants";
import { authHeaders } from "../auth/tokens";

const getApiBase = () => {
  console.log("API_BASE:", Constants?.expoConfig?.extra?.apiBaseUrl);
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

async function request(path, body) {
  const API_BASE = getApiBase();
  console.log('📡 Making request to:', `${API_BASE}${path}`);
  // Avoid logging sensitive payloads (passwords, tokens).
  
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout

    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('📥 Response status:', res.status, res.statusText);

    const text = await res.text();

    let json;
    try {
      json = JSON.parse(text);
      // Avoid logging response payloads (may include tokens).
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid response: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      // For 400 status codes (validation errors), log at info level instead of error
      // The error will be displayed inline in the UI
      if (res.status === 400) {
        console.log('⚠️ Validation error:', json.error || json);
      } else {
        console.error('❌ Request failed:', json);
      }
      const errorMsg = json.error || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.response = json;
      throw error;
    }

    return json;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timeout - server did not respond in 10 seconds');
      throw new Error('Request timeout - please check your connection and try again');
    }
    // Don't log validation errors (400 status) as errors - they're expected and shown inline
    if (error.status === 400) {
      // Validation errors are handled in the UI, no need to log as errors
      throw error;
    }
    console.error('❌ Request error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function requestAuth(path, body, options = {}) {
  const API_BASE = getApiBase();
  const headers = await authHeaders(options);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000);

    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 204) {
      return null;
    }

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid response: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      const errorMsg = json.error || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.response = json;
      throw error;
    }

    return json;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout - please check your connection and try again");
    }
    throw error;
  }
}

export function login({ email, password }) {
  return request('/auth/login', { email, password });
}

export function signup({ fullName, email, password, dateOfBirth, gender, phoneNumber, graduationYear, datingPreferences, friendsPreferences }) {
  return request('/auth/signup', {
    fullName,
    email,
    password,
    dateOfBirth,
    gender,
    phoneNumber,
    graduationYear,
    datingPreferences,
    friendsPreferences,
  });
}

export function checkEmail(email) {
  return request('/auth/check-email', { email });
}

export function cleanupSignup() {
  return requestAuth('/auth/cleanup-signup', null, { forceRefresh: true });
}

export function authStatus() {
  return requestAuth('/auth/status', null, { forceRefresh: true });
}
