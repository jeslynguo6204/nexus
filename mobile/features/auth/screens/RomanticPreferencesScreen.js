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
import styles from '../../../styles/AuthStyles';

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
          borderRadius: 999,
          backgroundColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
          borderWidth: selected ? 0 : 1,
          borderColor: 'rgba(255,255,255,0.4)',
          marginHorizontal: 6,
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

export default function RomanticPreferencesScreen({ navigation, route }) {
  const [men, setMen] = useState(false);
  const [women, setWomen] = useState(false);
  const [nonBinary, setNonBinary] = useState(false);
  const everyone = men && women && nonBinary;

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
  } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Convert to backend format
  const getPreference = () => {
    if (everyone) {
      return 'everyone';
    }
    if (men && !women && !nonBinary) {
      return 'male';
    }
    if (women && !men && !nonBinary) {
      return 'female';
    }
    if (nonBinary && !men && !women) {
      return 'non-binary';
    }
    // If multiple but not all, default to everyone
    return 'everyone';
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
    };

    if (skipPlatonic || !wantsPlatonic) {
      // Finish signup - navigate to completion
      navigation.navigate('CompleteSignup', params);
    } else {
      // Go to platonic preferences
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
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.entryTop}>
              <View style={styles.entryLogoCircle}>
                <Text style={styles.entryLogoText}>6°</Text>
              </View>

              <Text style={styles.entryAppName}>SIXDEGREES</Text>

              <Text style={styles.entryTagline}>
                Who would you like to meet romantically?
              </Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <View style={{ marginTop: 16, marginBottom: 32 }}>
                <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 24 }}>
                  Select all that apply. This only affects your romantic matches.
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
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
                  <SelectChip
                    label="Everyone"
                    selected={everyone}
                    onPress={() => {
                      const next = !everyone;
                      setMen(next);
                      setWomen(next);
                      setNonBinary(next);
                    }}
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
