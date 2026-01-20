// mobile/screens/SignupScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../../../styles/AuthStyles';

// ✅ use the shared auth API instead of defining API_BASE here
import { signup } from '../../../api/authAPI';

/**
 * Reusable select field:
 * - Looks like a normal text input
 * - Opens a modal with a Picker when tapped
 */
function SelectField({ label, value, placeholder, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  useEffect(() => {
    if (visible) {
      setTempValue(value || '');
    }
  }, [visible, value]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <>
      <Text style={styles.loginLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.loginInput}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={{ color: selectedOption ? '#FFFFFF' : '#D0E2FF' }}>
          {displayText}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContent}>
            <View style={styles.dateModalHeader}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.dateModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onChange(tempValue);
                  setVisible(false);
                }}
              >
                <Text style={styles.dateModalDone}>Done</Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={tempValue}
              onValueChange={(val) => setTempValue(val)}
            >
              <Picker.Item label={placeholder} value="" />
              {options.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function SignupScreen({ navigation, onSignedIn }) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDate, setDobDate] = useState(new Date(2004, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async function handleSignup() {
    try {
      setError('');

      // ✅ validate *before* setting loading
      if (!fullName?.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email?.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (!gender) {
        setError('Please select your gender');
        return;
      }
      if (!dateOfBirth) {
        setError('Please select your date of birth');
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        setError('Date of birth must be in YYYY-MM-DD format');
        return;
      }

      const dobObj = new Date(dateOfBirth);
      if (isNaN(dobObj.getTime())) {
        setError('Date of birth is invalid');
        return;
      }
      if (dobObj > new Date()) {
        setError('Date of birth cannot be in the future');
        return;
      }

      const payload = { email, password, fullName, dateOfBirth, gender };

      setLoading(true);

      // ✅ use shared API helper
      const json = await signup(payload);

      onSignedIn(json);
    } catch (e) {
      Alert.alert('Error', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  const genderOptions = [
    { label: 'Female', value: 'female' },
    { label: 'Male', value: 'male' },
    { label: 'Non-binary', value: 'non-binary' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <SafeAreaView style={styles.loginContainer}>
      {/* Back button, same as Login */}
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
          {/* White 6° logo centered */}
          <Text style={styles.loginLogo}>6°</Text>

          {/* Centered heading */}
          <Text style={styles.loginTitle}>Create your account</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 40,
              opacity: fadeAnim,
            }}
          >
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Full name */}
            <Text style={styles.loginLabel}>Full name</Text>
            <TextInput
              style={styles.loginInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jane Doe"
              placeholderTextColor="#D0E2FF"
              autoCapitalize="words"
            />

            {/* Email */}
            <Text style={styles.loginLabel}>Email</Text>
            <TextInput
              style={styles.loginInput}
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor="#D0E2FF"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Password */}
            <Text style={styles.loginLabel}>Password</Text>
            <TextInput
              style={styles.loginInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#D0E2FF"
              secureTextEntry
            />

            {/* Gender */}
            <SelectField
              label="Gender"
              value={gender}
              placeholder="Select gender…"
              options={genderOptions}
              onChange={setGender}
            />

            {/* Date of birth */}
            <Text style={styles.loginLabel}>Date of birth</Text>
            <TouchableOpacity
              style={styles.loginInput}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={{ color: dateOfBirth ? '#FFFFFF' : '#D0E2FF' }}>
                {dateOfBirth || 'Tap to choose your date of birth'}
              </Text>
            </TouchableOpacity>

            {/* Modal date picker */}
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.dateModalOverlay}>
                <View style={styles.dateModalContent}>
                  <View style={styles.dateModalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.dateModalCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setDateOfBirth(formatDate(dobDate));
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.dateModalDone}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    value={dobDate}
                    mode="date"
                    maximumDate={new Date()}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selected) => {
                      const current = selected || dobDate;
                      setDobDate(current);

                      if (Platform.OS === 'android') {
                        setDateOfBirth(formatDate(current));
                        setShowDatePicker(false);
                      }
                    }}
                  />
                </View>
              </View>
            </Modal>

            {/* Create account button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Please wait…' : 'Create account'}
              </Text>
            </TouchableOpacity>

            {/* Footer link to Login */}
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
    </SafeAreaView>
  );
}
