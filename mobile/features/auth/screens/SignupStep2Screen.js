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
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../../styles/AuthStyles';
import ChipRow from '../../profile/components/form-editor-components/ChipRow';

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export default function SignupStep2Screen({ navigation, route }) {
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];
  
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [pendingDate, setPendingDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [graduationYear, setGraduationYear] = useState('');
  
  // Field-specific error states
  const [genderError, setGenderError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [graduationYearError, setGraduationYearError] = useState('');
  
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fullName, email, phoneNumber, password } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const displayDateOfBirth = (date) => {
    if (!date) return 'Tap to choose your date of birth';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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
        if (dateOfBirthError) setDateOfBirthError('');
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
    if (dateOfBirthError) setDateOfBirthError('');
  };

  function handleContinue() {
    // Clear all previous errors
    setGenderError('');
    setDateOfBirthError('');
    setGraduationYearError('');
    
    let hasErrors = false;
    
    if (!gender) {
      setGenderError('Please select a gender');
      hasErrors = true;
    }
    
    if (!dateOfBirth) {
      setDateOfBirthError('Please choose your date of birth');
      hasErrors = true;
    }
    
    if (!graduationYear) {
      setGraduationYearError('Please select your graduation year');
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    const formatDateOfBirth = (date) => {
      if (!date) return '';
      return date.toISOString().slice(0, 10);
    };
    
    navigation.navigate('SignupStep3', {
      fullName,
      email,
      phoneNumber,
      password,
      gender,
      dateOfBirth: formatDateOfBirth(dateOfBirth),
      graduationYear: Number(graduationYear),
    });
  }

  return (
    <SafeAreaView style={styles.loginContainer} edges={['top', 'left', 'right']}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
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
          <Text style={styles.loginTitle}>About you</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 10,
              opacity: fadeAnim,
            }}
          >
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 6 }}>
              <Text style={styles.loginLabel}>Graduation year</Text>
              {graduationYearError ? (
                <Text style={styles.errorText}>{graduationYearError}</Text>
              ) : null}
            </View>
            <View style={[styles.loginInput, { paddingHorizontal: 0, paddingVertical: 0 }]}>
              <Picker
                selectedValue={graduationYear}
                onValueChange={(value) => {
                  setGraduationYear(value);
                  if (graduationYearError) setGraduationYearError('');
                }}
                style={{ color: '#FFFFFF' }}
              >
                <Picker.Item label="Select graduation year" value="" color="#D0E2FF" />
                {GRAD_YEARS.map((year) => (
                  <Picker.Item key={year} label={String(year)} value={String(year)} color="#FFFFFF" />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.loginButton]}
              onPress={handleContinue}
            >
              <Text style={styles.loginButtonText}>Continue</Text>
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
