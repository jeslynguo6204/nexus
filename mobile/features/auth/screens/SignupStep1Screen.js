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
import { checkEmail } from '../../../api/authAPI';

export default function SignupStep1Screen({ navigation, route }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Field-specific error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    if (limitedDigits.length === 0) {
      return '';
    } else if (limitedDigits.length <= 3) {
      return `(${limitedDigits}`;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    } else {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    if (phoneError) setPhoneError('');
  };

  const normalizePhone = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';
    return digits;
  };

  const isValidPhone = (value) => {
    const digits = normalizePhone(value);
    return digits.length === 10;
  };

  const isValidEmail = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const isValidPassword = (value) => {
    if (!value || value.length < 8) {
      return false;
    }
    return true;
  };

  const showExistingAccountAlert = () => {
    Alert.alert(
      'Account Already Exists',
      'An account belonging to that email address already exists.',
      [
        {
          text: 'Try another email address',
          style: 'cancel',
        },
        {
          text: 'Reset my password',
          onPress: () => {
            Alert.alert(
              'Coming soon!',
              'Password reset functionality is not implemented yet.'
            );
          },
        },
        {
          text: 'Sign-in',
          onPress: () => {
            navigation.navigate('Login');
          },
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  };

  async function handleContinue() {
    // Clear all previous errors
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    
    let hasErrors = false;
    
    // Validate all fields
    if (!fullName.trim()) {
      setFullNameError('Please enter your full name');
      hasErrors = true;
    }
    
    if (!email.trim()) {
      setEmailError('Please enter your school email');
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }
    
    const normalizedPhone = normalizePhone(phoneNumber);
    if (!normalizedPhone || !isValidPhone(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      hasErrors = true;
    }
    
    if (!password) {
      setPasswordError('Please enter a password');
      hasErrors = true;
    } else if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 8 characters long');
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    try {
      setLoading(true);
      // Check if email exists in backend users table
      const normalizedEmail = (email || '').trim().toLowerCase();
      const result = await checkEmail(normalizedEmail);
      
      if (result.exists) {
        showExistingAccountAlert();
        setEmailError('An account with this email already exists');
        return;
      }
      
      // Email doesn't exist, proceed to next step
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

  return (
    <SafeAreaView style={styles.loginContainer} edges={['top', 'left', 'right']}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Entry')}
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
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.loginLogo}>6°</Text>
          <Text style={styles.loginTitle}>Create your account</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 10,
              opacity: fadeAnim,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>Full name</Text>
              {fullNameError ? (
                <Text style={styles.errorText}>{fullNameError}</Text>
              ) : null}
            </View>
            <TextInput
              style={styles.loginInput}
              value={fullName}
              onChangeText={(value) => {
                setFullName(value);
                if (fullNameError) setFullNameError('');
              }}
              placeholder="Jane Doe"
              placeholderTextColor="#D0E2FF"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>School email</Text>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>
            <TextInput
              style={styles.loginInput}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError('');
              }}
              placeholder="you@school.edu"
              placeholderTextColor="#D0E2FF"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>Phone number</Text>
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}
            </View>
            <TextInput
              style={styles.loginInput}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="(XXX) XXX-XXXX"
              placeholderTextColor="#D0E2FF"
              keyboardType="phone-pad"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>Password</Text>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>
            <TextInput
              style={styles.loginInput}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Create a password"
              placeholderTextColor="#D0E2FF"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Please wait…' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
