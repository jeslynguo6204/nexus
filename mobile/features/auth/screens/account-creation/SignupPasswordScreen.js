/**
 * SignupPasswordScreen
 *
 * Password step of multi-step account creation. Collects password,
 * shows requirements and strength meter. On continue starts Cognito
 * email signup and navigates to ConfirmOtp.
 * Flow: SignupStep1 → SignupPassword → (Cognito signup) → ConfirmOtp → ...
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { AUTH_GRADIENT_CONFIG } from '../../../../styles/AuthStyles.v3';
import { formatUserError, logAppError } from '../../../../utils/errors';
import { deleteSignupUser, resendOtp, startEmailSignup } from '../../../../auth/cognito';

const PASSWORD_RULES = [
  {
    key: 'length',
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  {
    key: 'upper',
    label: '1 uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    key: 'lower',
    label: '1 lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: 'special',
    label: '1 special character',
    test: (value) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
  },
];

export default function SignupPasswordScreen({ navigation, route }) {
  const [password, setPassword] = useState(route?.params?.existingPassword || '');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cleanupError, setCleanupError] = useState('');
  const [focused, setFocused] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [logoLayout, setLogoLayout] = useState(null);
  const insets = useSafeAreaInsets();

  const passwordRef = useRef(null);
  const isMountedRef = useRef(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const backButtonTop = insets.top + 4;
  const logoTargetDelta = logoLayout
    ? Math.min(backButtonTop - logoLayout.y - 95, 0)
    : 0;
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

  const { fullName, email, phoneNumber, existingPassword, clearSignup } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
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
      toValue: keyboardVisible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [keyboardVisible, headerAnim]);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(false);
    }, [])
  );

  useEffect(() => {
    if (route?.params?.existingPassword && !password) {
      setPassword(route.params.existingPassword);
    }
  }, [route?.params?.existingPassword, password]);

  useFocusEffect(
    React.useCallback(() => {
      if (!clearSignup) return;

      const resetSignup = async () => {
        if (!email || !existingPassword) {
          navigation.setParams({ clearSignup: false });
          return;
        }

        try {
          setLoading(true);
          setCleanupError('');
          await deleteSignupUser(email, existingPassword);
        } catch (error) {
          logAppError(error, { screen: 'SignupPassword', action: 'cleanup' });
          const userMessage = formatUserError(error, 'Unable to reset signup. Please try again.');
          setCleanupError(userMessage);
          Alert.alert('Unable to reset signup', userMessage);
        } finally {
          setLoading(false);
          if (isMountedRef.current && navigation.isFocused()) {
            navigation.setParams({ clearSignup: false });
          }
        }
      };

      resetSignup();
    }, [clearSignup, email, existingPassword, navigation])
  );

  const isAccountCompleted = cleanupError
    .toLowerCase()
    .includes('account already completed');

  useEffect(() => {
    if (isAccountCompleted) {
      setPassword('');
      navigation.setParams({ existingPassword: '' });
    }
  }, [isAccountCompleted]);


  const ruleStatus = PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));

  const strengthScore = ruleStatus.filter((rule) => rule.met).length;
  const strengthSegments = strengthScore;
  const strengthLabel = strengthScore === PASSWORD_RULES.length
    ? 'Strong enough'
    : strengthScore === 0
    ? 'Start typing'
    : 'Almost there';
  const strengthColor = strengthScore === PASSWORD_RULES.length
    ? '#34D399'
    : strengthScore >= 2
    ? '#FBBF24'
    : '#F97316';

  const hasAllRules = strengthScore === PASSWORD_RULES.length;

  const getPasswordError = () => {
    if (!password) return 'Required';
    if (!hasAllRules) return 'Must meet all requirements';
    return null;
  };

  async function handleContinue() {
    setPasswordError('');

    const passwordErr = getPasswordError();
    if (passwordErr) {
      setPasswordError(passwordErr);
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = await startEmailSignup(email, password);
      navigation.setParams({ existingPassword: password });
      navigation.navigate('ConfirmOtp', {
        fullName,
        email: normalizedEmail,
        phoneNumber,
        password,
        existingPassword: password,
      });
    } catch (error) {
      logAppError(error, { screen: 'SignupPassword', action: 'continue' });
      const message = String(error.message || error);
      const lowerMessage = message.toLowerCase();
      const isUsernameExists =
        lowerMessage.includes('usernameexistsexception') ||
        lowerMessage.includes('useralreadyexists') ||
        lowerMessage.includes('already exists');

      if (isUsernameExists) {
        if (existingPassword && existingPassword !== password) {
          try {
            await deleteSignupUser(email, existingPassword);
            const normalizedEmail = await startEmailSignup(email, password);
            navigation.setParams({ existingPassword: password });
            navigation.navigate('ConfirmOtp', {
              fullName,
              email: normalizedEmail,
              phoneNumber,
              password,
              existingPassword: password,
            });
            return;
          } catch (deleteError) {
            logAppError(deleteError, { screen: 'SignupPassword', action: 'deleteExisting' });
            const userMessage = formatUserError(deleteError, 'Unable to reset signup. Please try again.');
            setPasswordError(userMessage);
            Alert.alert('Error', userMessage);
            setLoading(false);
            return;
          }
        }

        try {
          await resendOtp(email);
          navigation.navigate('ConfirmOtp', {
            fullName,
            email,
            phoneNumber,
            password,
            existingPassword: password,
          });
          return;
        } catch (resendError) {
          logAppError(resendError, { screen: 'SignupPassword', action: 'resend' });
          const resendMessage = String(resendError.message || resendError);
          const lowerResend = resendMessage.toLowerCase();
          const isAlreadyConfirmed =
            lowerResend.includes('already confirmed') ||
            lowerResend.includes('confirmed') ||
            lowerResend.includes('invalidparameterexception');

          if (isAlreadyConfirmed && existingPassword) {
            try {
              await deleteSignupUser(email, existingPassword);
              const normalizedEmail = await startEmailSignup(email, password);
              navigation.setParams({ existingPassword: password });
              navigation.navigate('ConfirmOtp', {
                fullName,
                email: normalizedEmail,
                phoneNumber,
                password,
                existingPassword: password,
              });
              return;
            } catch (deleteError) {
              logAppError(deleteError, { screen: 'SignupPassword', action: 'deleteConfirmed' });
              const userMessage = formatUserError(deleteError, 'Unable to reset signup. Please try again.');
              setPasswordError(userMessage);
              Alert.alert('Error', userMessage);
              setLoading(false);
              return;
            }
          }

          const userMessage = formatUserError(resendError, 'We could not send a new code. Please try again.');
          setPasswordError(userMessage);
          Alert.alert('Error', userMessage);
          setLoading(false);
          return;
        }
      }

      const userMessage = formatUserError(error, 'Unable to continue. Please try again.');
      setPasswordError(userMessage);
      Alert.alert('Error', userMessage);
      setLoading(false);
    }
  }

  const inputStyle = (key, hasError) => ([
    styles.input,
    focused === key && styles.inputFocused,
    hasError && styles.inputError,
  ]);

  return (
    <LinearGradient
      colors={AUTH_GRADIENT_CONFIG.colors}
      start={AUTH_GRADIENT_CONFIG.start}
      end={AUTH_GRADIENT_CONFIG.end}
      style={styles.gradientFill}
    >
      <SafeAreaView style={styles.authContainer} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + 4 }]}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.authContent} {...panResponder.panHandlers}>
            <View
              onLayout={(event) => {
                if (logoLayout) return;
                const { y } = event.nativeEvent.layout;
                setLogoLayout({ y });
              }}
              style={{ opacity: 0 }}
              pointerEvents="none"
            >
              <Text style={styles.logo}>6°</Text>
            </View>

            {logoLayout ? (
              <Animated.Text
                style={{
                  ...styles.logo,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: logoLayout.y,
                  textAlign: 'center',
                  transform: [
                    {
                      translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, logoTargetDelta],
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
                ],
              }}
            >
              <Animated.Text
                style={{
                  ...styles.title,
                  opacity: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                }}
              >
                Create your password
              </Animated.Text>
              <Animated.Text
                style={{
                  ...styles.subtitle,
                  opacity: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                }}
              >
                Make it secure and memorable.
              </Animated.Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.formWrap,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -160],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.fieldBlock, { marginBottom: 16 }]}
              >
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Password</Text>
                  {!!passwordError && <Text style={styles.inlineError}>{passwordError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('password', !!passwordError)}
                  ref={passwordRef}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (passwordError) setPasswordError('');
                    if (cleanupError) setCleanupError('');
                  }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="At least 8 characters"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleContinue}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                {ruleStatus.map((rule) => (
                  <View
                    key={rule.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: rule.met ? '#34D399' : 'rgba(255,255,255,0.35)',
                        backgroundColor: rule.met ? '#34D399' : 'transparent',
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        color: rule.met ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)',
                        fontSize: 13,
                        fontWeight: '600',
                      }}
                    >
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{ marginTop: 8, height: 40 }} pointerEvents="none">
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {PASSWORD_RULES.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor:
                          index < strengthSegments
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
                    color: strengthScore === PASSWORD_RULES.length
                      ? '#A7F3D0'
                      : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {strengthLabel}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && { opacity: 0.75 }]}
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Please wait...' : 'Continue'}
                </Text>
              </TouchableOpacity>

              {cleanupError ? (
                <View style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={styles.errorText}>{cleanupError}</Text>
                  {isAccountCompleted && (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login')}
                      disabled={loading}
                      style={{ marginTop: 8 }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' }}>
                        Go to sign in
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
