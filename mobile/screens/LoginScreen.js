import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../styles/AuthStyles';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

export default function LoginScreen({ navigation, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleLogin() {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Auth failed');

      onSignedIn(json);
    } catch (e) {
      Alert.alert('Error', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.loginContainer}>
    {/* Back button */}
     <TouchableOpacity
        onPress={() => navigation.navigate('Entry')}
        style={[styles.loginBackButton, { top: insets.top + 4 }]}  // 👈 use safe-area
        >
        <Text style={styles.loginBackText}>← Back</Text>
    </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* White 6° logo centered */}
          <Text style={styles.loginLogo}>6°</Text>

          {/* Centered heading */}
          <Text style={styles.loginTitle}>Welcome back!</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 40,
              opacity: fadeAnim,
            }}
          >
            <Text style={styles.loginLabel}>Email</Text>
            <TextInput
              style={styles.loginInput}
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor="#D0E2FF"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.loginLabel}>Password</Text>
            <TextInput
              style={styles.loginInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#D0E2FF"
              secureTextEntry
            />

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.loginForgotWrapper}
              onPress={() => Alert.alert(
                'Coming soon!', 
                'Forgot password flow is not implemented yet.')}
            >
              <Text style={styles.loginForgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Please wait…' : 'Log in'}
              </Text>
            </TouchableOpacity>

            {/* Footer link */}
            <TouchableOpacity
              style={{ marginTop: 20, alignSelf: 'center' }}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.loginFooterText}>
                Don’t have an account?{' '}
                <Text style={styles.loginFooterLink}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
