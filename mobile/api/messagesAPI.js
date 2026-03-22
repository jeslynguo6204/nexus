// mobile/api/messagesAPI.js
import Constants from 'expo-constants';
import { authHeaders } from '../auth/tokens';

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';
};

export async function sendMessage(matchId, messageBody, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const headers = await authHeaders();

    const url = `${API_BASE}/messages/${matchId}/send?mode=${mode}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ body: messageBody }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // { chatId, message }
  } catch (error) {
    throw error;
  }
}

export async function getMessages(chatId, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const headers = await authHeaders();

    const url = `${API_BASE}/messages/chat/${chatId}?mode=${mode}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Array of MessageRow[]
  } catch (error) {
    throw error;
  }
}

export async function markMessagesAsRead(chatId, mode = 'romantic') {
  if (!chatId || chatId === 'null' || chatId === 'undefined') {
    return { markedCount: 0 };
  }

  try {
    const API_BASE = getApiBase();
    const headers = await authHeaders();

    const url = `${API_BASE}/messages/chat/${chatId}/mark-read?mode=${mode}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // { markedCount }
  } catch (error) {
    throw error;
  }
}

export async function getUnreadConversationsCount() {
  try {
    const API_BASE = getApiBase();
    const headers = await authHeaders();

    const response = await fetch(`${API_BASE}/messages/unread-count`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // { romanticCount, platonicCount, totalCount }
  } catch (error) {
    throw error;
  }
}
