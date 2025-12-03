import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend base URL. On iOS Simulator use localhost, on Android emulator use 10.0.2.2
const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  async function doLogin() {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return Alert.alert('Error', json.error || 'Login failed');
      await AsyncStorage.setItem('token', json.token);
      onAuth();
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }

  async function doSignup() {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, dateOfBirth: '2000-01-01' }),
      });
      const json = await res.json();
      if (!res.ok) return Alert.alert('Error', json.error || 'Signup failed');
      await AsyncStorage.setItem('token', json.token);
      onAuth();
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>{mode === 'login' ? 'Login' : 'Sign up'}</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      {mode === 'signup' && (
        <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      )}

      <Button title={mode === 'login' ? 'Log in' : 'Sign up'} onPress={mode === 'login' ? doLogin : doSignup} />

      <View style={{ height: 12 }} />
      <Button title={mode === 'login' ? "Switch to Sign up" : 'Switch to Login'} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} />
    </View>
  );
}
