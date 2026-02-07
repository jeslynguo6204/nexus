/**
 * SignupStep1Screen
 *
 * First step of multi-step account creation. Collects: full name, phone,
 * email. Validates and checks email availability; on continue
 * navigates to SignupPassword with params.
 * Flow: Entry → Sign up → SignupStep1 → SignupPassword → ConfirmOtp →
 *       SignupStep2 → ...
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
import { checkEmail } from '../../../../api/authAPI';
import { formatUserError, logAppError } from '../../../../utils/errors';

export default function SignupStep1Screen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [logoLayout, setLogoLayout] = useState(null);
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
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

  useFocusEffect(
    React.useCallback(() => {
      setLoading(false);
    }, [])
  );

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

      navigation.navigate('SignupPassword', {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
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
        logAppError(e, { screen: 'SignupStep1', action: 'checkEmail' });
        setEmailError(formatUserError(e, 'Please check your email and try again.'));
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
                  autoCorrect={false}
                  autoCapitalize="sentences"
                  textContentType="name"
                  autoComplete="name"
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
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
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
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  showSoftInputOnFocus={true}
                  editable={true}
                />
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
