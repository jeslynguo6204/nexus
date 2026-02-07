/**
 * SignupScreen
 *
 * Entry point for new-account signup. Currently a stub: immediately replaces
 * with SignupStep1 (multi-step account-creation flow).
 * Flow: SignupScreen → SignupStep1 → SignupStep2 → ConfirmOtp → (post-OTP)
 *       Welcome → RomanticPreferences / PlatonicPreferences → CompleteSignup.
 *
 * LEGACY: The component body below (return null) is dead code. It was the
 * original single-screen signup (name, phone, email, password, gender, DOB);
 * that flow has been replaced by SignupStep1 + SignupStep2 + ConfirmOtp.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../../styles/AuthStyles';
import { startEmailSignup } from '../../../auth/cognito';
import { formatUserError, logAppError } from '../../../utils/errors';
import ChipRow from '../../profile/components/form-editor-components/ChipRow';

export default function SignupScreen({ navigation }) {
  // Redirect to the new multi-step signup flow
  React.useEffect(() => {
    navigation.replace('SignupStep1');
  }, [navigation]);

  return null;
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [pendingDate, setPendingDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Field-specific error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDateOfBirth = (date) => {
    if (!date) return '';
    return date.toISOString().slice(0, 10);
  };

  const displayDateOfBirth = (date) => {
    if (!date) return 'Tap to choose your birthday';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits for US format
    const limitedDigits = digits.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
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
    // Clear error when user starts typing
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
    // Basic email validation - must contain @ and a domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const isValidPassword = (value) => {
    if (!value || value.length < 8) {
      return false;
    }
    return true;
  };

  const openDatePicker = () => {
    const baseDate = dateOfBirth || pendingDate;
    setPendingDate(baseDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setDateOfBirth(selectedDate);
      }
      setShowDatePicker(false);
    } else if (selectedDate) {
      setPendingDate(selectedDate);
    }
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleDateDone = () => {
    setDateOfBirth(pendingDate);
    setShowDatePicker(false);
    // Clear error when date is selected
    if (dateOfBirthError) setDateOfBirthError('');
  };

  const isExistingAccountError = (error) => {
    const errorMessage = String(error?.message || error || '').toLowerCase();
    const errorName = String(error?.name || '').toLowerCase();
    
    return (
      errorName.includes('usernameexists') ||
      errorName.includes('aliasexists') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('username exists') ||
      errorMessage.includes('account with the given email') ||
      errorMessage.includes('user already exists')
    );
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

  async function handleSignup() {
    // Clear all previous errors
    setError('');
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setGenderError('');
    setDateOfBirthError('');
    
    let hasErrors = false;
    
    // Validate all fields and set field-specific errors
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
      setPhoneError('Please enter a valid phone number');
      hasErrors = true;
    }
    
    if (!password) {
      setPasswordError('Please enter a password');
      hasErrors = true;
    } else if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 8 characters long');
      hasErrors = true;
    }
    
    if (!gender) {
      setGenderError('Please select a gender');
      hasErrors = true;
    }
    
    if (!dateOfBirth) {
      setDateOfBirthError('Please choose your date of birth');
      hasErrors = true;
    }
    
    // If there are validation errors, stop here
    if (hasErrors) {
      return;
    }
    
    try {
      setLoading(true);
      const normalizedEmail = await startEmailSignup(email, password);
      navigation.navigate('ConfirmOtp', {
        email: normalizedEmail,
        password,
        fullName: fullName.trim(),
        gender,
        dateOfBirth: formatDateOfBirth(dateOfBirth),
        phoneNumber: normalizedPhone,
      });
    } catch (e) {
      // Check if this is an existing account error
      if (isExistingAccountError(e)) {
        showExistingAccountAlert();
        setEmailError('An account with this email already exists');
      } else {
        // For other errors (like network issues), show as general error
        logAppError(e, { screen: 'Signup', action: 'continue' });
        const userMessage = formatUserError(e, 'Unable to continue. Please try again.');
        setError(userMessage);
      }
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
              placeholder="************"
              placeholderTextColor="#D0E2FF"
              secureTextEntry
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>Gender</Text>
              {genderError ? (
                <Text style={styles.errorText}>{genderError}</Text>
              ) : null}
            </View>
            <ChipRow
              options={genderOptions}
              selected={gender}
              onSelect={(value) => {
                setGender(value);
                if (genderError) setGenderError('');
              }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>Date of birth</Text>
              {dateOfBirthError ? (
                <Text style={styles.errorText}>{dateOfBirthError}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.loginInput} onPress={openDatePicker}>
              <Text style={{ color: dateOfBirth ? '#FFFFFF' : '#D0E2FF' }}>
                {displayDateOfBirth(dateOfBirth)}
              </Text>
            </TouchableOpacity>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Sending code…' : 'Get verification code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 20, alignSelf: 'center' }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginFooterText}>
                Already have an account?{' '}
                <Text style={styles.loginFooterLink}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={showDatePicker}>
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalCancel} onPress={handleDateCancel}>
                  Cancel
                </Text>
                <Text style={styles.dateModalDone} onPress={handleDateDone}>
                  Done
                </Text>
              </View>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {showDatePicker && Platform.OS !== 'ios' ? (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      ) : null}
    </SafeAreaView>
  );
}
