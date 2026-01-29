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
import styles, { AUTH_GRADIENT_CONFIG, SPACE } from '../../../styles/AuthStyles.v3';
import { login } from '../../../auth/cognito';
import { checkEmail } from '../../../api/authAPI';

export default function LoginScreen({ navigation, onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
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

  function setFieldErrors(emailErr, passwordErr) {
    setEmailError(emailErr || '');
    setPasswordError(passwordErr || '');
  }

  async function handleLogin() {
    // Validate fields are filled
    if (!email.trim() || !password) {
      if (!email.trim()) {
        setFieldErrors('Please enter your email', '');
      } else {
        setFieldErrors('', 'Please enter your password');
      }
      return;
    }

    let emailCheck = null;
    let emailCheckSucceeded = false;

    try {
      setFieldErrors('', '');
      setLoading(true);

      // First, check if the email exists in our database
      try {
        emailCheck = await checkEmail(email.trim());
        emailCheckSucceeded = true;
      } catch (emailError) {
        // If checkEmail fails with validation error (400), show that error on email field
        if (emailError?.status === 400) {
          const errorMsg = emailError?.message || 'Invalid email format';
          setFieldErrors(errorMsg, '');
          setLoading(false);
          return;
        }
        // For other checkEmail errors (network, etc.), continue to try login
        // (might be a temporary issue, but email could still exist)
      }
      
      // If we got a response and email doesn't exist
      if (emailCheckSucceeded && emailCheck && !emailCheck.exists) {
        setFieldErrors('No account found with this email. Sign up to create an account.', '');
        setLoading(false);
        return;
      }

      // Email exists (or checkEmail failed but we'll try anyway), attempt login
      await login(email.trim(), password);

      if (onSignedIn) onSignedIn();
    } catch (e) {
      // This catch handles login errors
      const errorStr = String(e?.message || e || '');
      const errorLower = errorStr.toLowerCase();
      
      // If it's a network error
      if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('fetch')) {
        setFieldErrors('Connection error. Please check your internet and try again.', '');
      } else if (errorLower.includes('user not found') || errorLower.includes('does not exist')) {
        // Fallback: if Cognito says user not found
        setFieldErrors('No account found with this email. Sign up to create an account.', '');
      } else {
        // Login failed - if we successfully checked email exists, this must be wrong password
        if (emailCheckSucceeded && emailCheck && emailCheck.exists) {
          setFieldErrors('', 'Incorrect password.');
        } else {
          // We couldn't check email, so show generic error on email field
          setFieldErrors('Login failed. Please check your email and password.', '');
        }
      }
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
                    !!emailError && styles.inputError,
                  ]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    // Clear error when user starts typing
                    if (emailError) setEmailError('');
                  }}
                  placeholder="you@school.edu"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="username"
                  autoComplete="email"
                  onFocus={() => {
                    setEmailFocused(true);
                    // Clear error when field is focused
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
                {!!emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password */}
              <View style={[styles.fieldBlock, { position: 'relative' }]}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Password</Text>
                </View>

                <TextInput
                  style={[
                    styles.input,
                    pwFocused && styles.inputFocused,
                    !!passwordError && styles.inputError,
                  ]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    // Clear error when user starts typing
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={styles.tokens.placeholder}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="password"
                  onFocus={() => {
                    setPwFocused(true);
                    // Clear error when field is focused
                    if (passwordError) setPasswordError('');
                  }}
                  onBlur={() => setPwFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                
                {/* Error text in normal flow below input */}
                {!!passwordError && (
                  <Text style={styles.errorText}>{passwordError}</Text>
                )}

                {/* "Forgot password?" button positioned absolutely so it stays at fixed position (10px below input) */}
                <TouchableOpacity
                  style={{ 
                    position: 'absolute',
                    top: Platform.select({ ios: 78, android: 74 }),
                    right: 0,
                  }}
                  onPress={() =>
                    Alert.alert('Coming soon!', 'Forgot password flow is not implemented yet.')
                  }
                  activeOpacity={0.85}
                >
                  <Text style={[styles.subtitle, { marginTop: SPACE.s, textDecorationLine: 'underline' }]}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!email.trim() || !password || loading) && { opacity: 0.5 },
                ]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={!email.trim() || !password || loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Please wait…' : 'Log in'}</Text>
              </TouchableOpacity>

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
