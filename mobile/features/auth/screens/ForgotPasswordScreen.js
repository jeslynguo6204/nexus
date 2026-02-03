import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Keyboard,
  PanResponder,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import authStyles, { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';
import styles from '../../../styles/AuthStyles';
import { confirmPasswordReset, startPasswordReset } from '../../../auth/cognito';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request'); // request | confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [logoLayout, setLogoLayout] = useState(null);
  const insets = useSafeAreaInsets();
  const backButtonTop = insets.top + 4;
  const logoTargetDelta = logoLayout
    ? Math.min(backButtonTop - logoLayout.y - 16, 0)
    : 0;
  const fieldMinHeight = { minHeight: 100 };
  const emailInlineError = step === 'request' ? error : '';
  const confirmInlineError = step === 'confirm' ? error : '';

  const getPasswordStrength = (value) => {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score += 1;
    // if (/[A-Z]/.test(value)) score += 1;
    // if (/[a-z]/.test(value)) score += 1;
    // if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);
  const hasPassword = newPassword.length > 0;
  const strengthColor = strengthScore >= 1 ? '#34D399' : '#FBBF24';
  const strengthLabel = strengthScore >= 1 ? 'Strong enough' : 'Too short';
  const PASSWORD_METER_HEIGHT = 40;
  const strengthSegments = strengthScore >= 1 ? 2 : hasPassword ? 1 : 0;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 12 && Math.abs(gestureState.dx) < 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 20) {
          Keyboard.dismiss();
        }
      },
    })
  ).current;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: keyboardVisible && step === 'confirm' ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [keyboardVisible, step, headerAnim]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  async function handleRequest() {
    try {
      setError('');
      setLoading(true);
      await startPasswordReset(email);
      setStep('confirm');
      setResendTimer(30);
    } catch (e) {
      const message = String(e.message || e);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0 || resending) {
      return;
    }
    try {
      setError('');
      setResending(true);
      await startPasswordReset(email);
      setResendTimer(30);
    } catch (e) {
      const message = String(e.message || e);
      setError(message);
    } finally {
      setResending(false);
    }
  }

  async function handleConfirm() {
    try {
      setError('');
      setLoading(true);
      await confirmPasswordReset(email, code, newPassword);
      navigation.navigate('Login');
    } catch (e) {
      const message = String(e.message || e);
      setError(message);
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
      <SafeAreaView style={authStyles.authContainer}>
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
        <View style={authStyles.authContent} {...panResponder.panHandlers}>
          <View style={{ width: '100%' }}>
            <View
              onLayout={(event) => {
                if (logoLayout) return;
                const { y } = event.nativeEvent.layout;
                setLogoLayout({ y });
              }}
              style={{ opacity: 0 }}
              pointerEvents="none"
            >
              <Text style={styles.loginLogo}>6°</Text>
            </View>

            {logoLayout ? (
              <Animated.Text
                style={{
                  ...styles.loginLogo,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: logoLayout.y,
                  textAlign: 'center',
                  transform: [
                    {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, logoTargetDelta - 55],
                    }),
                    },
                    {
                      scale: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.5],
                      }),
                    },
                  ],
                }}
              >
                6°
              </Animated.Text>
            ) : null}

            <Animated.View
              style={{
                alignItems: 'center',
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -70],
                    }),
                  },
                  {
                    scale: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.75],
                    }),
                  },
                ],
              }}
            >
              <Text style={styles.loginTitle}>Reset your password</Text>
            </Animated.View>

            <Animated.View
              style={{
                width: '100%',
                marginTop: 40,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -90],
                    }),
                  },
                ],
              }}
            >
            <View
              style={[
                authStyles.fieldBlock,
                fieldMinHeight,
                step === 'request' && { marginBottom: -10 },
                step === 'confirm' && { marginBottom: 0 },
              ]}
            >
              <View style={authStyles.fieldHeaderRow}>
                <Text style={authStyles.label}>Email</Text>
                {!!emailInlineError && <Text style={authStyles.inlineError}>{emailInlineError}</Text>}
              </View>
              <TextInput
                style={[
                  authStyles.input,
                  emailFocused && authStyles.inputFocused,
                  !!emailInlineError && authStyles.inputError,
                  step === 'confirm' && { opacity: 0.55 },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@school.edu"
                placeholderTextColor={authStyles.tokens.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={step !== 'confirm'}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {step === 'confirm' ? (
              <>
                <View style={[authStyles.fieldBlock, fieldMinHeight, { marginBottom: 0 }]}>
                  <View style={authStyles.fieldHeaderRow}>
                    <Text style={authStyles.label}>Reset code</Text>
                    {!!confirmInlineError && <Text style={authStyles.inlineError}>{confirmInlineError}</Text>}
                  </View>
                  <TextInput
                    style={[
                      authStyles.input,
                      codeFocused && authStyles.inputFocused,
                      !!confirmInlineError && authStyles.inputError,
                    ]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter the code"
                    placeholderTextColor={authStyles.tokens.placeholder}
                    keyboardType="number-pad"
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                  />
                </View>

                <View style={[authStyles.fieldBlock, fieldMinHeight, { marginBottom: -55, paddingBottom: PASSWORD_METER_HEIGHT }]}>
                  <View style={authStyles.fieldHeaderRow}>
                    <Text style={authStyles.label}>New password</Text>
                  </View>
                  <TextInput
                    style={[authStyles.input, newPasswordFocused && authStyles.inputFocused]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Create a new password"
                    placeholderTextColor={authStyles.tokens.placeholder}
                    secureTextEntry
                    onFocus={() => setNewPasswordFocused(true)}
                    onBlur={() => setNewPasswordFocused(false)}
                  />
                  <View
                    style={{
                      marginTop: 8,
                      height: PASSWORD_METER_HEIGHT,
                    }}
                    pointerEvents="none"
                  >
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {[1, 2].map((segment) => (
                        <View
                          key={segment}
                          style={{
                            flex: 1,
                            height: 6,
                            borderRadius: 999,
                            backgroundColor:
                              segment <= strengthSegments
                                ? strengthColor
                                : 'rgba(255,255,255,0.2)',
                          }}
                        />
                      ))}
                    </View>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        fontWeight: '600',
                        color: strengthScore >= 1 ? '#A7F3D0' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {strengthLabel}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginButton,
                (loading ||
                  (step === 'request' && !email.trim()) ||
                  (step === 'confirm' && !code.trim() && !newPassword)) && { opacity: 0.6 },
              ]}
              onPress={step === 'request' ? handleRequest : handleConfirm}
              disabled={
                loading ||
                (step === 'request' && !email.trim()) ||
                (step === 'confirm' && !code.trim() && !newPassword)
              }
            >
              <Text style={styles.loginButtonText}>
                {loading
                  ? 'Please wait…'
                  : step === 'request'
                    ? 'Send reset code'
                    : 'Update password'}
              </Text>
            </TouchableOpacity>

            {error && step === 'confirm' ? null : null}

            {step === 'confirm' ? (
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
            ) : null}
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
