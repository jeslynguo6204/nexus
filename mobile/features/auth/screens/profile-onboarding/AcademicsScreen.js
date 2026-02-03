/**
 * AcademicsScreen (Section 4.2)
 *
 * Profile onboarding: add school, major, and graduation year.
 * Reached from AddPhotosScreen. On continue navigates to LikesDislikesScreen.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
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
import styles from '../../../../styles/AuthStyles';

function AcademicsInput({ label, placeholder, value, onChangeText, editable = true }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#E5F2FF', marginBottom: 8 }}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        style={{
          backgroundColor: editable ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: editable ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          fontSize: 15,
          fontWeight: '500',
          opacity: editable ? 1 : 0.7,
        }}
      />
    </View>
  );
}

function AcademicYearChip({ year, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 18,
        paddingVertical: 10,
        minHeight: 44,
        borderRadius: 999,
        backgroundColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: selected ? 'transparent' : 'rgba(255,255,255,0.3)',
        marginHorizontal: 6,
        marginBottom: 10,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: selected ? '#1F6299' : '#FFFFFF',
        }}
      >
        {year}
      </Text>
    </TouchableOpacity>
  );
}

const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

export default function AcademicsScreen({ navigation, route }) {
  const [school, setSchool] = useState('University of Pennsylvania');
  const [major, setMajor] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const routeParams = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function handleContinue() {
    navigation.navigate('LikesDislikesScreen', {
      ...routeParams,
      school,
      major,
      academicYear,
    });
  }

  return (
    <LinearGradient
      colors={['#1F6299', '#34A4FF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.entryContainer} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <Text style={styles.entryTagline}>Academics</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 32 }}>
                Penn context helps spark better connections.
              </Text>

              <AcademicsInput
                label="School"
                placeholder="Your Penn school"
                value={school}
                onChangeText={setSchool}
                editable={false}
              />

              <AcademicsInput
                label="Major"
                placeholder="What are you studying?"
                value={major}
                onChangeText={setMajor}
              />

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#E5F2FF', marginBottom: 12 }}>
                  Academic Year
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {ACADEMIC_YEARS.map(year => (
                    <AcademicYearChip
                      key={year}
                      year={year}
                      selected={academicYear === year}
                      onPress={() => setAcademicYear(year)}
                    />
                  ))}
                </View>
              </View>

              <View style={{ alignItems: 'center', width: '100%', marginTop: 12 }}>
                <TouchableOpacity
                  style={styles.entryPrimaryButton}
                  onPress={handleContinue}
                  activeOpacity={0.9}
                >
                  <Text style={styles.entryPrimaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
