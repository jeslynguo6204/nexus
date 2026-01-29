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
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 999,
          backgroundColor: selected ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
          borderWidth: selected ? 0 : 1,
          borderColor: 'rgba(255,255,255,0.4)',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: selected ? '#1F6299' : '#FFFFFF',
        }}
      >
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
                Let&apos;s personalize your experience.
              </Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <View style={{ marginTop: 16, marginBottom: 32 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 }}>
                  What type of connections are you interested in?
                </Text>
                <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 24 }}>
                  Select one or both. You can change this anytime.
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
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

              <View style={{ alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={[
                    styles.entryPrimaryButton,
                    (!romantic && !platonic) && { opacity: 0.5 },
                  ]}
                  onPress={handleContinue}
                  disabled={!romantic && !platonic}
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
