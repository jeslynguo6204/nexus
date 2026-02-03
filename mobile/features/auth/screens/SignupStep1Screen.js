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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';
import { checkEmail } from '../../../api/authAPI';

export default function SignupStep1Screen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [logoLayout, setLogoLayout] = useState(null);
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const FIELD_SPACING = 20;

  const insets = useSafeAreaInsets();
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (!digits) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber(formatPhoneNumber(value));
    if (phoneError) setPhoneError('');
  };

  const normalizePhone = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    const digits = trimmed.replace(/\D/g, '');
    return digits || '';
  };

  const getPhoneError = (value) => {
    const normalized = normalizePhone(value);
    if (!normalized) return 'Required';
    if (normalized.length < 10) return 'Must be 10 digits';
    return null;
  };

  const isValidEmail = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const getPasswordError = (value) => {
    if (!value) return 'Required';
    if (value.length < 8) return 'Must be at least 8 characters';
    //if (!/[A-Z]/.test(value)) return 'Must include an uppercase letter';
    //if (!/[a-z]/.test(value)) return 'Must include a lowercase letter';
    //if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Must include a special character';
    return null;
  };

  const getPasswordStrength = (value) => {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score += 1;
    // if (/[A-Z]/.test(value)) score += 1;
    // if (/[a-z]/.test(value)) score += 1;
    // if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const hasPassword = password.length > 0;
  const strengthColor = strengthScore >= 1 ? '#34D399' : '#FBBF24';
  const strengthLabel = strengthScore >= 1 ? 'Strong enough' : 'Too short';
  const PASSWORD_METER_HEIGHT = 40;
  const strengthSegments = strengthScore >= 1 ? 2 : hasPassword ? 1 : 0;

  const showExistingAccountAlert = () => {
    Alert.alert(
      'Account Already Exists',
      'An account belonging to that email address already exists.',
      [
        { text: 'Try another email address', style: 'cancel' },
        {
          text: 'Reset my password',
          onPress: () =>
            Alert.alert('Coming soon!', 'Password reset functionality is not implemented yet.'),
        },
        {
          text: 'Sign-in',
          onPress: () => navigation.navigate('Login'),
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  async function handleContinue() {
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');

    let hasErrors = false;

    // Validate full name
    if (!fullName.trim()) {
      setFullNameError('Required');
      hasErrors = true;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Required');
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid email format');
      hasErrors = true;
    }

    // Validate phone
    const phoneErr = getPhoneError(phoneNumber);
    if (phoneErr) {
      setPhoneError(phoneErr);
      hasErrors = true;
    }

    // Validate password
    const passwordErr = getPasswordError(password);
    if (passwordErr) {
      setPasswordError(passwordErr);
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      setLoading(true);
      const normalizedEmail = (email || '').trim().toLowerCase();
      const normalizedPhone = normalizePhone(phoneNumber);
      
      const result = await checkEmail(normalizedEmail);

      if (result.exists) {
        showExistingAccountAlert();
        setEmailError('Account already exists');
        setLoading(false);
        return;
      }

      navigation.navigate('SignupStep2', {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        password,
      });
    } catch (e) {
      // Extract error message from various possible formats
      let errorMessage = '';
      if (e.response?.error) {
        errorMessage = String(e.response.error);
      } else if (e.message) {
        errorMessage = String(e.message);
      } else {
        errorMessage = String(e);
      }
      
      // Set appropriate error message (displays as red inline text like other field errors)
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('must be a school email') || lowerMessage.includes('school email')) {
        setEmailError('Must be a school email');
      } else if (lowerMessage.includes("isn't supported yet") || lowerMessage.includes("isn't available yet") || lowerMessage.includes('not supported')) {
        setEmailError("That school isn't supported yet");
      } else if (lowerMessage.includes('already exists') || lowerMessage.includes('already registered')) {
        setEmailError('Account already exists');
      } else {
        setEmailError(errorMessage);
      }
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
          onPress={() => navigation.navigate('Entry')}
          style={[styles.backButton, { top: insets.top + 4 }]}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.authContent} {...panResponder.panHandlers}>
            {/* White centered logo (no circle) */}
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
                Create your account
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
                A couple details and you’ll be in.
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
              <View style={[styles.fieldBlock, { marginBottom: FIELD_SPACING }]}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Full name</Text>
                  {!!fullNameError && <Text style={styles.inlineError}>{fullNameError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('fullName', !!fullNameError)}
                  ref={fullNameRef}
                  value={fullName}
                  onChangeText={(v) => {
                    setFullName(v);
                    if (fullNameError) setFullNameError('');
                  }}
                  onFocus={() => setFocused('fullName')}
                  onBlur={() => setFocused(null)}
                  placeholder="Jane Doe"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>

              <View style={[styles.fieldBlock, { marginBottom: FIELD_SPACING }]}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>School email</Text>
                  {!!emailError && <Text style={styles.inlineError}>{emailError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('email', !!emailError)}
                  ref={emailRef}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (emailError) setEmailError('');
                  }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="pennkey@upenn.edu"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>

              <View style={[styles.fieldBlock, { marginBottom: FIELD_SPACING }]}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Phone number</Text>
                  {!!phoneError && <Text style={styles.inlineError}>{phoneError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('phone', !!phoneError)}
                  ref={phoneRef}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  placeholder="(XXX) XXX-XXXX"
                  placeholderTextColor={styles.tokens.placeholder}
                  keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
                  showSoftInputOnFocus={true}
                  editable={true}
                />
              </View>

              <View style={[styles.fieldBlock, { marginBottom: -75, paddingBottom: PASSWORD_METER_HEIGHT }]}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Password</Text>
                  {!!passwordError && <Text style={styles.inlineError}>{passwordError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('password', !!passwordError)}
                  ref={passwordRef}
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (passwordError) setPasswordError('');
                  }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="At least 8 characters"
                  placeholderTextColor={styles.tokens.placeholder}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleContinue}
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

              <TouchableOpacity
                style={[styles.primaryButton, loading && { opacity: 0.75 }]}
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Please wait…' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
