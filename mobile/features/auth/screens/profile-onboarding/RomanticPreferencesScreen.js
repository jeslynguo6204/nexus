/**
 * RomanticPreferencesScreen
 *
 * Profile onboarding: select who you want to meet romantically (e.g. men,
 * women, non-binary). Reached from Welcome when user chose romantic mode.
 * On continue navigates to PlatonicPreferences (if platonic also chosen) or
 * CompleteSignup. Passes romanticPreference (and other params) forward.
 * Flow: Welcome → RomanticPreferences → [PlatonicPreferences] → CompleteSignup.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../../../styles/AuthStyles';

// Chip styles matching EntryScreen vibe - white chips on gradient
function SelectChip({ label, selected, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
        style={[
        {
          paddingHorizontal: 20,
          paddingVertical: 12,
          minHeight: 48,
          borderRadius: 999,
          backgroundColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          borderColor: selected ? 'transparent' : 'rgba(255,255,255,0.4)',
          marginHorizontal: 6,
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: selected ? '#1F6299' : '#FFFFFF',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function prefToChips(pref) {
  if (!Array.isArray(pref) || pref.length === 0) return { men: false, women: false, nonBinary: false };
  return {
    men: pref.includes('male'),
    women: pref.includes('female'),
    nonBinary: pref.includes('non-binary'),
  };
}

export default function RomanticPreferencesScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const { romanticPreference } = routeParams;
  const initial = prefToChips(romanticPreference);
  const [men, setMen] = useState(initial.men);
  const [women, setWomen] = useState(initial.women);
  const [nonBinary, setNonBinary] = useState(initial.nonBinary);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    fullName,
    email,
    phoneNumber,
    password,
    gender,
    dateOfBirth,
    graduationYear,
    wantsPlatonic,
    skipPlatonic,
    fromLogin,
  } = routeParams;

  useEffect(() => {
    const next = prefToChips(romanticPreference);
    setMen(next.men);
    setWomen(next.women);
    setNonBinary(next.nonBinary);
  }, [romanticPreference]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Convert to backend format: array of 'male' | 'female' | 'non-binary' (at least one, up to 3)
  const getPreference = () => {
    const arr = [];
    if (men) arr.push('male');
    if (women) arr.push('female');
    if (nonBinary) arr.push('non-binary');
    return arr;
  };

  function handleContinue() {
    if (!men && !women && !nonBinary) {
      return; // At least one must be selected
    }

    const romanticPreference = getPreference();
    const params = {
      fullName,
      email,
      phoneNumber,
      password,
      gender,
      dateOfBirth,
      graduationYear,
      wantsRomantic: true,
      wantsPlatonic,
      romanticPreference,
      fromLogin: !!fromLogin,
      onBackWithData: routeParams.onBackWithData,
    };

    if (skipPlatonic || !wantsPlatonic) {
      navigation.navigate('AddPhotosScreen', params);
    } else {
      navigation.navigate('PlatonicPreferences', params);
    }
  }

  function handleSkip() {
    const params = {
      fullName,
      email,
      phoneNumber,
      password,
      gender,
      dateOfBirth,
      graduationYear,
      wantsRomantic: true,
      wantsPlatonic,
      romanticPreference: ['male', 'female', 'non-binary'],
      fromLogin: !!fromLogin,
      onBackWithData: routeParams.onBackWithData,
    };

    if (skipPlatonic || !wantsPlatonic) {
      navigation.navigate('AddPhotosScreen', params);
    } else {
      navigation.navigate('PlatonicPreferences', params);
    }
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
          onPress={() => {
            routeParams.onBackWithData?.({ wantsRomantic: true, wantsPlatonic: wantsPlatonic ?? false });
            navigation.goBack();
          }}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          style={{ position: 'absolute', right: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>Skip →</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <View style={styles.entryLogoCircle}>
                <Text style={styles.entryLogoText}>6°</Text>
              </View>

              <Text style={styles.entryAppName}>SIXDEGREES</Text>

              <Text style={styles.entryTagline}>
                Who would you like to meet romantically?
              </Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 40 }}>
                  Select all that apply. This only affects your <Text style={{ fontWeight: '700' }}>romantic</Text> matches.
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                  <SelectChip
                    label="Men"
                    selected={men}
                    onPress={() => setMen(!men)}
                  />
                  <SelectChip
                    label="Women"
                    selected={women}
                    onPress={() => setWomen(!women)}
                  />
                  <SelectChip
                    label="Non-Binary"
                    selected={nonBinary}
                    onPress={() => setNonBinary(!nonBinary)}
                  />
                </View>
              </View>

              <View style={{ alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={[
                    styles.entryPrimaryButton,
                    (!men && !women && !nonBinary) && { opacity: 0.5 },
                  ]}
                  onPress={handleContinue}
                  disabled={!men && !women && !nonBinary}
                  activeOpacity={0.9}
                >
                  <Text style={styles.entryPrimaryButtonText}>
                    {skipPlatonic || !wantsPlatonic ? 'Finish' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
