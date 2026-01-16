// mobile/screens/LoginScreen.js
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

// ✅ use shared auth API
import { login } from '../api/authAPI';

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
      console.log('🔐 Attempting login with email:', email);

      const json = await login({ email, password });
      console.log('✅ Login successful, response:', json);

      if (!json || !json.token) {
        console.error('❌ No token in login response:', json);
        Alert.alert('Error', 'Login failed: No token received');
        return;
      }

      console.log('📞 Calling onSignedIn with:', json);
      if (onSignedIn) {
        await onSignedIn(json);
        console.log('✅ onSignedIn completed');
      } else {
        console.error('❌ onSignedIn callback is not defined!');
        Alert.alert('Error', 'Login callback not available');
      }
    } catch (e) {
      console.error('❌ Login error:', e);
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
        style={[styles.loginBackButton, { top: insets.top + 4 }]}
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
              onPress={() =>
                Alert.alert(
                  'Coming soon!',
                  'Forgot password flow is not implemented yet.'
                )
              }
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
