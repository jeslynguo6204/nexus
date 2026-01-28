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
  const [resendTimer, setResendTimer] = useState(30);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const email = route?.params?.email || '';
  const password = route?.params?.password || '';
  const fullName = route?.params?.fullName || '';
  const gender = route?.params?.gender || '';
  const dateOfBirth = route?.params?.dateOfBirth || '';
  const phoneNumber = route?.params?.phoneNumber || '';
  const graduationYear = route?.params?.graduationYear || null;
  const datingPreferences = route?.params?.datingPreferences || null;
  const friendsPreferences = route?.params?.friendsPreferences || null;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Start countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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
        phoneNumber,
        graduationYear,
        datingPreferences,
        friendsPreferences,
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
    if (resendTimer > 0) {
      return; // Don't allow resend if timer is still counting
    }
    
    try {
      setError('');
      setResending(true);
      await resendOtp(email);
      setResendTimer(30); // Reset timer to 30 seconds
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
          
          {email ? (
            <Text style={[styles.loginFooterText, { marginTop: 8, textAlign: 'center' }]}>
              We sent a code to <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{email}</Text>
            </Text>
          ) : null}

          <Animated.View
            style={{
              width: '100%',
              marginTop: 20,
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
                style={resending || resendTimer > 0 ? { opacity: 0.6 } : {}}
                onPress={handleResend}
                disabled={resending || resendTimer > 0}
              >
                <Text style={styles.loginFooterText}>
                  {resending 
                    ? 'Sending…' 
                    : resendTimer > 0 
                    ? `Resend code (${resendTimer}s)` 
                    : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
