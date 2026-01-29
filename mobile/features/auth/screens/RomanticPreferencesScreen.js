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
import styles, { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';

// Black and white chip styles for preference screens
const blackWhiteChipStyles = {
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderColor: 'rgba(0,0,0,0.20)',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.72)',
  },
  chipTextSelected: {
    color: 'rgba(0,0,0,0.92)',
    fontWeight: '600',
  },
};

function SelectChip({ label, selected, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        blackWhiteChipStyles.chip,
        selected && blackWhiteChipStyles.chipSelected,
        style,
      ]}
    >
      <Text style={[blackWhiteChipStyles.chipText, selected && blackWhiteChipStyles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function RomanticPreferencesScreen({ navigation, route }) {
  const [men, setMen] = useState(true);
  const [women, setWomen] = useState(true);
  const [nonBinary, setNonBinary] = useState(true);
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
            <Text style={styles.title}>Romantic</Text>
            <Text style={styles.subtitle}>Who would you like to meet romantically?</Text>

            <Animated.View style={[styles.formWrap, { opacity: fadeAnim }]}>
              <View style={styles.fieldBlock}>
                <Text style={[styles.subtitle, { marginBottom: 16 }]}>Select all that apply.</Text>

                <View style={styles.chipWrap}>
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

                <Text style={[styles.subtitle, { marginTop: 12, fontSize: 13 }]}>
                  This only affects your romantic matches.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (!men && !women && !nonBinary) && { opacity: 0.5 }]}
                onPress={handleContinue}
                disabled={!men && !women && !nonBinary}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>
                  {skipPlatonic || !wantsPlatonic ? 'Finish' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
