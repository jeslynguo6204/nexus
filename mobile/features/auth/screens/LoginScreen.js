// mobile/screens/LoginScreen.js (AuthStyles.v3)
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';
import { login } from '../../../auth/cognito';

export default function LoginScreen({ navigation, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  async function handleLogin() {
    try {
      setError('');
      setLoading(true);

      await login(email.trim(), password);

      if (onSignedIn) onSignedIn();
    } catch (e) {
      const message = String(e?.message || e);
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={AUTH_GRADIENT_CONFIG.colors}
      start={AUTH_GRADIENT_CONFIG.start}
      end={AUTH_GRADIENT_CONFIG.end}
      style={styles.gradientFill}
    >
      <SafeAreaView style={styles.authContainer} edges={['top', 'left', 'right']}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Entry')}
          style={[styles.backButton, { top: insets.top + 4 }]}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.authContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.logo}>6°</Text>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Log in to continue.</Text>

            <Animated.View style={[styles.formWrap, { opacity: fadeAnim }]}>
              {/* Email */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Email</Text>
                </View>

                <TextInput
                  style={[
                    styles.input,
                    emailFocused && styles.inputFocused,
                    !!error && styles.inputError,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@school.edu"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="username"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Password</Text>
                </View>

                <TextInput
                  style={[
                    styles.input,
                    pwFocused && styles.inputFocused,
                    !!error && styles.inputError,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={styles.tokens.placeholder}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="password"
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <TouchableOpacity
                  style={{ marginTop: 10, alignSelf: 'flex-end' }}
                  onPress={() =>
                    Alert.alert('Coming soon!', 'Forgot password flow is not implemented yet.')
                  }
                  activeOpacity={0.85}
                >
                  <Text style={[styles.subtitle, { marginTop: 0, textDecorationLine: 'underline' }]}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : 'Log in'}</Text>
              </TouchableOpacity>

              {!!error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Footer link */}
              <TouchableOpacity
                style={{ marginTop: 18, alignSelf: 'center' }}
                onPress={() => navigation.navigate('SignupStep1')}
                activeOpacity={0.85}
              >
                <Text style={styles.subtitle}>
                  Don’t have an account?{' '}
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', textDecorationLine: 'underline' }}>
                    Sign up
                  </Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
