import React, { useState } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/AuthStyles';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

export default function SignupScreen({ navigation, onSignedIn }) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDate, setDobDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async function handleSignup() {
    try {
      setLoading(true);
      setError('');

      // same validation you had in AuthScreen
      if (!fullName?.trim()) {
        setError('Please enter your full name');
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

      const body = { email, password, fullName, dateOfBirth, gender };

      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Auth failed');
      }

      onSignedIn(json);
    } catch (e) {
      Alert.alert('Error', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>6°</Text>
        </View>

        <Text style={styles.appName}>Create your account</Text>
        <Text style={styles.subtitle}>It only takes a minute</Text>

        <View style={styles.card}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Jane Doe"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={gender}
              onValueChange={(val) => setGender(val)}
              style={styles.picker}
            >
              <Picker.Item label="Select gender..." value="" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Non-binary" value="non-binary" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          <Text style={styles.label}>Date of birth</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{dateOfBirth || 'Tap to choose your date of birth'}</Text>
          </TouchableOpacity>

          {/* Modal date picker that’s easy to close */}
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

                    // On Android, commit immediately and close
                    if (Platform.OS === 'android') {
                      setDateOfBirth(formatDate(current));
                      setShowDatePicker(false);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Please wait…' : 'Create account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchAuthRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.switchAuthText}>
              Already have an account?{' '}
              <Text style={styles.switchAuthLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
