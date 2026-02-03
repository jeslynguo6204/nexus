/**
 * AcademicsScreen (Section 4.2)
 *
 * Profile onboarding: add school, major, and year.
 * Reached from AddPhotosScreen. On continue navigates to LikesDislikesScreen.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';

import styles, { AUTH_GRADIENT_CONFIG } from '../../../../styles/AuthStyles.v3';
import ChipGrid from '../../components/ChipGrid'; // adjust path to wherever you put it
import PrimaryCTA from '../../components/PrimaryCTA'; // adjust path if needed

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

function LockedRow({ label, value }) {
  return (
    <View style={[styles.fieldBlock, { marginBottom: 20 }]}>
      <View style={styles.fieldHeaderRow}>
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Read-only “info row” (not a disabled input) */}
      <View
        style={[
          styles.input,
          {
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.14)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.92)' }}>
          {value}
        </Text>

        <FontAwesome6
          name="lock"
          size={14}
          color="rgba(255,255,255,0.55)"
        />
      </View>
    </View>
  );
}

export default function AcademicsScreen({ navigation, route }) {
  const routeParams = route.params || {};

  const [school, setSchool] = useState(routeParams.school ?? 'University of Pennsylvania');
  const [major, setMajor] = useState(routeParams.major ?? '');
  const [year, setYear] = useState(routeParams.academicYear ?? '');

  const [majorError, setMajorError] = useState('');
  const [yearError, setYearError] = useState('');

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(null);

  const majorRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 12 && Math.abs(gestureState.dx) < 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 20) Keyboard.dismiss();
      },
    })
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (routeParams.school != null) setSchool(routeParams.school);
    if (routeParams.major != null) setMajor(routeParams.major);
    if (routeParams.academicYear != null) setYear(routeParams.academicYear);
  }, [routeParams.school, routeParams.major, routeParams.academicYear]);

  function handleBack() {
    navigation.navigate('AddPhotosScreen', {
      ...routeParams,
      school,
      major,
      academicYear: year,
    });
  }

  function handleSkip() {
    navigation.navigate('LikesDislikesScreen', { ...routeParams });
  }

  function handleContinue() {
    setMajorError('');
    setYearError('');

    let hasErrors = false;

    // If you want major optional, delete this block
    if (!major.trim()) {
      setMajorError('Required');
      hasErrors = true;
    }
    if (!year) {
      setYearError('Pick one');
      hasErrors = true;
    }
    if (hasErrors) return;

    navigation.navigate('LikesDislikesScreen', {
      ...routeParams,
      school,
      major: major.trim(),
      academicYear: year,
    });
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
        {/* Back */}
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { top: insets.top + 4 }]}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: 'absolute',
            right: 16,
            top: insets.top + 4,
            zIndex: 30,
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
        >
          <Text style={[styles.backText, { opacity: 0.9 }]}>Skip →</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.authContent, { paddingTop: 8 }]} {...panResponder.panHandlers}>
              {/* Small app name at top (editorial / IG-like) */}
              <Text
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  color: '#E5F2FF',
                  opacity: 0.75,
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                SIX DEGREES
              </Text>

              <View style={{ alignItems: 'center', marginTop: 2 }}>
                <Text style={styles.title}>Let’s start with the basics</Text>
                <Text style={styles.subtitle}>Just enough to place you on campus.</Text>
              </View>

              <Animated.View
                style={[
                  styles.formWrap,
                  {
                    opacity: fadeAnim,
                    marginTop: 14, // pulled up a bit
                  },
                ]}
              >
                <LockedRow label="School" value={school} />

                <View style={[styles.fieldBlock, { marginBottom: 20 }]}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.label}>Major</Text>
                    {!!majorError && <Text style={styles.inlineError}>{majorError}</Text>}
                  </View>

                  <TextInput
                    ref={majorRef}
                    style={inputStyle('major', !!majorError)}
                    value={major}
                    onChangeText={(v) => {
                      setMajor(v);
                      if (majorError) setMajorError('');
                    }}
                    onFocus={() => setFocused('major')}
                    onBlur={() => setFocused(null)}
                    placeholder="What are you studying?"
                    placeholderTextColor={styles.tokens?.placeholder ?? 'rgba(255,255,255,0.5)'}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                  />
                </View>

                <View style={[styles.fieldBlock, { marginBottom: 18 }]}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.label}>Year</Text>
                    {!!yearError && <Text style={styles.inlineError}>{yearError}</Text>}
                  </View>

                  <ChipGrid
                    options={YEARS}
                    value={year}
                    onChange={(v) => {
                      setYear(v);
                      if (yearError) setYearError('');
                    }}
                    columns={2}
                  />

                  <Text
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      fontWeight: '600',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    You can change this later.
                  </Text>
                </View>

                <PrimaryCTA
  label="Continue"
  onPress={handleContinue}
  buttonStyle={styles.primaryButton}
  textStyle={styles.primaryButtonText}
/>

              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
