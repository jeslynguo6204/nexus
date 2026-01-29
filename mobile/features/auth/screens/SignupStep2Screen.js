import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';
import ChipRow from '../../profile/components/form-editor-components/ChipRow';
import { startEmailSignup } from '../../../auth/cognito';

const GRAD_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

export default function SignupStep2Screen({ navigation, route }) {
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-Binary', value: 'non-binary' },
  ];

  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [pendingDate, setPendingDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [graduationYear, setGraduationYear] = useState(null);

  const [genderError, setGenderError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [graduationYearError, setGraduationYearError] = useState('');

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fullName, email, phoneNumber, password } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const displayDateOfBirth = (date) => {
    if (!date) return 'Choose a date';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openDatePicker = () => {
    setPendingDate(dateOfBirth || pendingDate);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'set' && selectedDate) {
        setDateOfBirth(selectedDate);
        if (dateOfBirthError) setDateOfBirthError('');
      }
      setShowDatePicker(false);
    } else if (selectedDate) {
      setPendingDate(selectedDate);
    }
  };

  const handleDateCancel = () => setShowDatePicker(false);

  const handleDateDone = () => {
    setDateOfBirth(pendingDate);
    setShowDatePicker(false);
    if (dateOfBirthError) setDateOfBirthError('');
  };

  const formatDateOfBirth = (date) => (date ? date.toISOString().slice(0, 10) : '');

  function handleContinue() {
    setGenderError('');
    setDateOfBirthError('');
    setGraduationYearError('');

    let hasErrors = false;

    if (!gender) {
      setGenderError('Required');
      hasErrors = true;
    }
    if (!dateOfBirth) {
      setDateOfBirthError('Required');
      hasErrors = true;
    }
    if (!graduationYear) {
      setGraduationYearError('Required');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Start email signup to trigger OTP
    startEmailSignup(email, password)
      .then((normalizedEmail) => {
        navigation.navigate('ConfirmOtp', {
          fullName,
          email: normalizedEmail,
          phoneNumber,
          password,
          gender,
          dateOfBirth: formatDateOfBirth(dateOfBirth),
          graduationYear: Number(graduationYear),
        });
      })
      .catch((error) => {
        Alert.alert('Error', error.message || 'Failed to start signup');
      });
  }

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
          <ScrollView
            contentContainerStyle={styles.authContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.logo}>6°</Text>
            <Text style={styles.title}>About you</Text>
            <Text style={styles.subtitle}>A few basics to get started.</Text>

            <Animated.View style={[styles.formWrap, { opacity: fadeAnim }]}>
              {/* Gender */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Gender</Text>
                  {!!genderError && <Text style={styles.inlineError}>{genderError}</Text>}
                </View>

                <ChipRow
                  options={genderOptions}
                  selected={gender}
                  onSelect={(value) => {
                    setGender(value);
                    if (genderError) setGenderError('');
                  }}
                  wrap
                  stylesOverride={styles}
                />
              </View>

              {/* DOB */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Date of birth</Text>
                  {!!dateOfBirthError && <Text style={styles.inlineError}>{dateOfBirthError}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.selectField, !!dateOfBirthError && styles.selectFieldError]}
                  onPress={openDatePicker}
                  activeOpacity={0.9}
                >
                  <Text style={dateOfBirth ? styles.selectValueText : styles.selectPlaceholderText}>
                    {displayDateOfBirth(dateOfBirth)}
                  </Text>
                  <Text style={styles.selectChevron}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Graduation Year (chips) */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.label}>Graduation year</Text>
                  {!!graduationYearError && <Text style={styles.inlineError}>{graduationYearError}</Text>}
                </View>

                <ChipRow
                  options={GRAD_YEARS.map((y) => ({ label: String(y), value: y }))}
                  selected={graduationYear}
                  onSelect={(value) => {
                    setGraduationYear(value);
                    if (graduationYearError) setGraduationYearError('');
                  }}
                  wrap
                  stylesOverride={styles}
                />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.9}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* iOS DOB modal */}
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

        {/* Android DOB picker */}
        {showDatePicker && Platform.OS === 'android' ? (
          <DateTimePicker
            value={pendingDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}
