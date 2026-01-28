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
import ChipRow from '../../profile/components/form-editor-components/ChipRow';

export default function SignupScreen({ navigation }) {
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
    if (!date) return 'Tap to choose your date of birth';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const normalizePhone = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    const hasPlus = trimmed.startsWith('+');
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';
    return hasPlus ? `+${digits}` : digits;
  };

  const isValidPhone = (value) => /^\+?\d{10,15}$/.test(value);

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
  };

  async function handleSignup() {
    try {
      setError('');
      if (!fullName.trim()) {
        throw new Error('Please enter your full name');
      }
      const normalizedPhone = normalizePhone(phoneNumber);
      if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
        throw new Error('Please enter a valid phone number');
      }
      if (!gender) {
        throw new Error('Please select a gender');
      }
      if (!dateOfBirth) {
        throw new Error('Please choose your date of birth');
      }
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
      setError(String(e.message || e));
      Alert.alert('Error', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.loginContainer}>
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
        >
          <Text style={styles.loginLogo}>6°</Text>
          <Text style={styles.loginTitle}>Create your account</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 40,
              opacity: fadeAnim,
            }}
          >
            <Text style={styles.loginLabel}>Full name</Text>
            <TextInput
              style={styles.loginInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jane Doe"
              placeholderTextColor="#D0E2FF"
            />

            <Text style={styles.loginLabel}>Phone number</Text>
            <TextInput
              style={styles.loginInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="(555) 123-4567"
              placeholderTextColor="#D0E2FF"
              keyboardType="phone-pad"
            />

            <Text style={styles.loginLabel}>School email</Text>
            <TextInput
              style={styles.loginInput}
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor="#D0E2FF"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.loginLabel}>Password</Text>
            <TextInput
              style={styles.loginInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#D0E2FF"
              secureTextEntry
            />

            <Text style={styles.loginLabel}>Gender</Text>
            <ChipRow
              options={genderOptions}
              selected={gender}
              onSelect={setGender}
            />

            <Text style={styles.loginLabel}>Date of birth</Text>
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
                {loading ? 'Sending code…' : 'Send code'}
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
