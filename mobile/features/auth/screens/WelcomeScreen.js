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
import ChipRow from '../../profile/components/form-editor-components/ChipRow';

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

export default function WelcomeScreen({ navigation, route }) {
  const [romantic, setRomantic] = useState(false);
  const [platonic, setPlatonic] = useState(false);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fullName, email, phoneNumber, password, gender, dateOfBirth, graduationYear } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function handleContinue() {
    if (!romantic && !platonic) {
      return; // At least one must be selected
    }

    const params = {
      fullName,
      email,
      phoneNumber,
      password,
      gender,
      dateOfBirth,
      graduationYear,
      wantsRomantic: romantic,
      wantsPlatonic: platonic,
    };

    // Navigate based on what was selected
    if (romantic && platonic) {
      // Go to romantic first, then platonic
      navigation.navigate('RomanticPreferences', params);
    } else if (romantic) {
      // Only romantic
      navigation.navigate('RomanticPreferences', { ...params, skipPlatonic: true });
    } else {
      // Only platonic
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
            <Text style={styles.title}>Welcome to SixDegrees</Text>
            <Text style={styles.subtitle}>Let's personalize your experience. You can change this anytime.</Text>

            <Animated.View style={[styles.formWrap, { opacity: fadeAnim }]}>
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>What type of connections are you interested in?</Text>
                <Text style={[styles.subtitle, { marginTop: 4, marginBottom: 16 }]}>Select one or both.</Text>

                <View style={styles.chipWrap}>
                  <SelectChip
                    label="Romantic"
                    selected={romantic}
                    onPress={() => setRomantic(!romantic)}
                  />
                  <SelectChip
                    label="Platonic"
                    selected={platonic}
                    onPress={() => setPlatonic(!platonic)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (!romantic && !platonic) && { opacity: 0.5 }]}
                onPress={handleContinue}
                disabled={!romantic && !platonic}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
