// mobile/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import styles from '../styles/AuthStyles';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

export default function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      const path = mode === 'login' ? '/auth/login' : '/auth/signup';
      const body =
        mode === 'login'
          ? { email, password }
          : { email, password, fullName }; // adapt to your backend

      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Auth failed');
      }

      // let parent store token, etc.
      onSignedIn(json);
    } catch (e) {
      Alert.alert('Error', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>6°</Text>
        </View>

        <Text style={styles.appName}>Six Degrees</Text>
        <Text style={styles.subtitle}>
          Meet people just a few connections away.
        </Text>

        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'login' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('login')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'login' && styles.modeButtonTextActive,
              ]}
            >
              Log in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'signup' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('signup')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'signup' && styles.modeButtonTextActive,
              ]}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Jane Doe"
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
