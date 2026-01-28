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
import styles from '../../../styles/AuthStyles';
import { confirmEmailOtp, login, resendOtp } from '../../../auth/cognito';
import { signup as signupToBackend } from '../../../api/authAPI';

export default function ConfirmOtpScreen({ navigation, route, onSignedIn }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const email = route?.params?.email || '';
  const password = route?.params?.password || '';
  const fullName = route?.params?.fullName || '';
  const gender = route?.params?.gender || '';
  const dateOfBirth = route?.params?.dateOfBirth || '';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleVerify() {
    try {
      setError('');
      setLoading(true);
      await confirmEmailOtp(email, code);
      await signupToBackend({
        fullName,
        email,
        password,
        dateOfBirth,
        gender,
      });
      await login(email, password);
      if (onSignedIn) {
        onSignedIn();
      }
    } catch (e) {
      const message = String(e.message || e);
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setError('');
      setResending(true);
      await resendOtp(email);
      Alert.alert('Sent', 'We just sent you a new code.');
    } catch (e) {
      const message = String(e.message || e);
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.loginContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
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
          <Text style={styles.loginLogo}>6°</Text>
          <Text style={styles.loginTitle}>Verify your email</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 40,
              opacity: fadeAnim,
            }}
          >
            <Text style={styles.loginLabel}>Verification code</Text>
            <TextInput
              style={styles.loginInput}
              value={code}
              onChangeText={setCode}
              placeholder="Enter the 6-digit code"
              placeholderTextColor="#D0E2FF"
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleVerify}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Verifying…' : 'Verify'}
              </Text>
            </TouchableOpacity>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <TouchableOpacity
                style={resending && { opacity: 0.6 }}
                onPress={handleResend}
                disabled={resending}
              >
                <Text style={styles.loginFooterText}>
                  {resending ? 'Sending…' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
