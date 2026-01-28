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

  const isValidPhone = (value) => normalizePhone(value).length === 10;

  const isValidEmail = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const isValidPassword = (value) => !!value && value.length >= 8;

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

    if (!fullName.trim()) {
      setFullNameError('Required');
      hasErrors = true;
    }

    if (!email.trim()) {
      setEmailError('Required');
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Invalid');
      hasErrors = true;
    }

    const normalizedPhone = normalizePhone(phoneNumber);
    if (!normalizedPhone || !isValidPhone(phoneNumber)) {
      setPhoneError('Invalid');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Required');
      hasErrors = true;
    } else if (!isValidPassword(password)) {
      setPasswordError('Min 8 chars');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      setLoading(true);
      const normalizedEmail = (email || '').trim().toLowerCase();
      const result = await checkEmail(normalizedEmail);

      if (result.exists) {
        showExistingAccountAlert();
        setEmailError('Exists');
        return;
      }

      navigation.navigate('SignupStep2', {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phoneNumber: normalizedPhone,
        password,
      });
    } catch (e) {
      const errorMessage = String(e.message || e);
      setEmailError(errorMessage);
    } finally {
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
                  keyboardType="phone-pad"
                  returnKeyType="next"
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
