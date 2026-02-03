/**
 * CompleteSignupScreen
 *
 * Final step of account creation. Receives all collected signup data via
 * route.params (from Romantic/PlatonicPreferences). Calls backend signup API,
 * then Cognito login; on success calls onSignedIn() and user enters the app.
 * Flow: Reached from RomanticPreferences or PlatonicPreferences → (API + login)
 *       → onSignedIn → main app (BottomTabs).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { signup as signupToBackend } from '../../../api/authAPI';
import { login } from '../../../auth/cognito';

export default function CompleteSignupScreen({ navigation, route, onSignedIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    wantsRomantic,
    wantsPlatonic,
    romanticPreference,
    platonicPreference,
  } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Automatically complete signup when screen loads
    handleCompleteSignup();
  }, []);

  async function handleCompleteSignup() {
    try {
      setError('');
      setLoading(true);

      // Prepare preferences for backend (arrays: male, female, non-binary; at least one, up to 3)
      const datingPreferences = wantsRomantic && Array.isArray(romanticPreference) && romanticPreference.length > 0
        ? {
            preference: romanticPreference,
            notLooking: false,
          }
        : {
            preference: null,
            notLooking: true,
          };

      const friendsPreferences = wantsPlatonic && Array.isArray(platonicPreference) && platonicPreference.length > 0
        ? {
            preference: platonicPreference,
          }
        : null;

      await signupToBackend({
        fullName,
        email,
        password,
        dateOfBirth,
        gender,
        phoneNumber,
        graduationYear,
        datingPreferences,
        friendsPreferences,
      });

      // Login after successful signup
      await login(email, password);

      if (onSignedIn) {
        onSignedIn();
      }
    } catch (e) {
      const errorMessage = String(e.message || e);
      let displayError = errorMessage;
      
      // Handle specific error types with user-friendly messages
      if (errorMessage === "Must be a school email" || errorMessage.includes('Must be a school email')) {
        displayError = 'Must be a school email';
      } else if (errorMessage === "That school isn't supported yet" || errorMessage.includes("isn't supported yet")) {
        displayError = "That school isn't supported yet";
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        displayError = 'An account with this email already exists';
      } else if (errorMessage.includes('Missing required')) {
        displayError = 'Please fill in all required fields';
      }
      
      setError(displayError);
      Alert.alert('Error', displayError);
      setLoading(false);
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.authContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.formWrap, { opacity: fadeAnim, alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 120 }]}>
              <Text style={styles.logo}>6°</Text>
              <Text style={styles.title}>Setting up your account...</Text>
              {loading && (
                <Text style={[styles.subtitle, { marginTop: 16 }]}>
                  Please wait while we finish creating your profile.
                </Text>
              )}
              {error && (
                <Text style={[styles.subtitle, { marginTop: 16, color: styles.tokens?.danger || '#FF6B6B' }]}>
                  {error}
                </Text>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
