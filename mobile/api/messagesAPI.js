// mobile/api/messagesAPI.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getApiBase = () => {
  return Constants?.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';
};

export async function sendMessage(matchId, messageBody, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const url = `${API_BASE}/messages/${matchId}/send?mode=${mode}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ body: messageBody }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // { chatId, messageId, message }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getMessages(chatId, mode = 'romantic') {
  try {
    const API_BASE = getApiBase();
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const url = `${API_BASE}/messages/chat/${chatId}?mode=${mode}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Array of MessageRow[]
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}
