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
import { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';
import styles from '../../../styles/AuthStyles';
import { confirmPasswordReset, startPasswordReset } from '../../../auth/cognito';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request'); // request | confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const placeholderColor = 'rgba(255,255,255,0.62)';
  const inputBorderColor = 'rgba(255,255,255,0.22)';
  const fieldSpacing = { marginBottom: 16 };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleRequest() {
    try {
      setError('');
      setLoading(true);
      await startPasswordReset(email);
      setStep('confirm');
      Alert.alert('Check your email', 'We sent a reset code.');
    } catch (e) {
      const message = String(e.message || e);
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    try {
      setError('');
      setLoading(true);
      await confirmPasswordReset(email, code, newPassword);
      Alert.alert('Password updated', 'You can now log in with your new password.');
      navigation.navigate('Login');
    } catch (e) {
      const message = String(e.message || e);
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
      style={{ flex: 1 }}
    >
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
          <Text style={styles.loginTitle}>Reset your password</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 40,
              opacity: fadeAnim,
            }}
          >
            <View style={fieldSpacing}>
              <Text style={styles.loginLabel}>Email</Text>
              <TextInput
                style={[styles.loginInput, { borderColor: inputBorderColor }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@school.edu"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {step === 'confirm' ? (
              <>
                <View style={fieldSpacing}>
                  <Text style={styles.loginLabel}>Reset code</Text>
                  <TextInput
                    style={[styles.loginInput, { borderColor: inputBorderColor }]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter the code"
                    placeholderTextColor={placeholderColor}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={fieldSpacing}>
                  <Text style={styles.loginLabel}>New password</Text>
                  <TextInput
                    style={[styles.loginInput, { borderColor: inputBorderColor }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Create a new password"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry
                  />
                </View>
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={step === 'request' ? handleRequest : handleConfirm}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading
                  ? 'Please wait…'
                  : step === 'request'
                    ? 'Send reset code'
                    : 'Update password'}
              </Text>
            </TouchableOpacity>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {step === 'confirm' ? (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={handleRequest}
                  disabled={loading}
                >
                  <Text style={styles.loginFooterText}>Resend code</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
