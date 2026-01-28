import Constants from "expo-constants";

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || "http://localhost:4000";
};

async function request(path, body) {
  const API_BASE = getApiBase();
  console.log('📡 Making request to:', `${API_BASE}${path}`);
  console.log('📤 Request body:', body);
  
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
    console.log('📥 Response text:', text);

    let json;
    try {
      json = JSON.parse(text);
      console.log('📥 Response data:', json);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid response: ${text.substring(0, 100)}`);
    }

    if (!res.ok) {
      console.error('❌ Request failed:', json);
      throw new Error(json.error || `Request failed with status ${res.status}`);
    }

    return json;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timeout - server did not respond in 10 seconds');
      throw new Error('Request timeout - please check your connection and try again');
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

export function login({ email, password }) {
  return request('/auth/login', { email, password });
}

export function signup({ fullName, email, password, dateOfBirth, gender, phoneNumber }) {
  return request('/auth/signup', {
    fullName,
    email,
    password,
    dateOfBirth,
    gender,
    phoneNumber,
  });
}
