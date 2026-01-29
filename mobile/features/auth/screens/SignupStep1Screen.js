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

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
    if (!/[A-Z]/.test(value)) return 'Must include an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Must include a lowercase letter';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Must include a special character';
    return null;
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
          <ScrollView
            contentContainerStyle={styles.authContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* White centered logo (no circle) */}
            <Text style={styles.logo}>6°</Text>

            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>A couple details and you’ll be in.</Text>

            <Animated.View style={[styles.formWrap, { opacity: fadeAnim }]}>
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Full name</Text>
                  {!!fullNameError && <Text style={styles.inlineError}>{fullNameError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('fullName', !!fullNameError)}
                  value={fullName}
                  onChangeText={(v) => {
                    setFullName(v);
                    if (fullNameError) setFullNameError('');
                  }}
                  onFocus={() => setFocused('fullName')}
                  onBlur={() => setFocused(null)}
                  placeholder="Jane Doe"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>School email</Text>
                  {!!emailError && <Text style={styles.inlineError}>{emailError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('email', !!emailError)}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (emailError) setEmailError('');
                  }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@school.edu"
                  placeholderTextColor={styles.tokens.placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Phone number</Text>
                  {!!phoneError && <Text style={styles.inlineError}>{phoneError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('phone', !!phoneError)}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  placeholder="(XXX) XXX-XXXX"
                  placeholderTextColor={styles.tokens.placeholder}
                  keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'phone-pad'}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  showSoftInputOnFocus={true}
                  editable={true}
                />
              </View>

              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Password</Text>
                  {!!passwordError && <Text style={styles.inlineError}>{passwordError}</Text>}
                </View>
                <TextInput
                  style={inputStyle('password', !!passwordError)}
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
                  returnKeyType="done"
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
