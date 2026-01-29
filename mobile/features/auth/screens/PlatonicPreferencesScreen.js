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

function SelectChip({ label, selected, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function PlatonicPreferencesScreen({ navigation, route }) {
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
    romanticPreference,
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

  function handleFinish() {
    if (!men && !women && !nonBinary) {
      return; // At least one must be selected
    }

    const platonicPreference = getPreference();
    const params = {
      fullName,
      email,
      phoneNumber,
      password,
      gender,
      dateOfBirth,
      graduationYear,
      wantsRomantic: !!romanticPreference,
      wantsPlatonic: true,
      romanticPreference,
      platonicPreference,
    };

    // Finish signup
    navigation.navigate('CompleteSignup', params);
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
            <Text style={styles.title}>Friends</Text>
            <Text style={styles.subtitle}>Who would you like to connect with as friends?</Text>

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
                  This only affects your friends connections.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (!men && !women && !nonBinary) && { opacity: 0.5 }]}
                onPress={handleFinish}
                disabled={!men && !women && !nonBinary}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>Finish</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
