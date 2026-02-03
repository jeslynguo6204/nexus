/**
 * CompleteSignupScreen
 *
 * Final step of onboarding. Account and profile were already created when the user
 * verified their email (ConfirmOtpScreen → createUserProfileFromOtp + login).
 * This screen only saves all onboarding data to the profile via PATCH /profiles/me,
 * then calls onSignedIn() so the user enters the app.
 * Flow: KeyAffiliationsScreen → CompleteSignupScreen → updateMyProfile() → onSignedIn.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles, { AUTH_GRADIENT_CONFIG } from '../../../styles/AuthStyles.v3';
import { updateMyProfile } from '../../../api/profileAPI';

function trimArray(arr, max = 3) {
  const list = Array.isArray(arr) ? arr : [];
  const trimmed = list.map((s) => String(s ?? '').trim()).filter((s) => s.length > 0);
  const uniq = [...new Set(trimmed)];
  return uniq.slice(0, max);
}

export default function CompleteSignupScreen({ navigation, route, onSignedIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const params = route.params || {};

  const {
    fullName,
    gender,
    graduationYear,
    wantsRomantic,
    wantsPlatonic,
    romanticPreference,
    platonicPreference,
    major,
    academicYear,
    likes,
    dislikes,
    affiliations,
    featuredAffiliations,
  } = params;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    handleCompleteSignup();
  }, []);

  async function handleCompleteSignup() {
    try {
      setError('');
      setLoading(true);

      // Build profile update from onboarding data (same shape as edit-profile PATCH)
      const payload = {};

      if (fullName != null && String(fullName).trim()) {
        payload.displayName = String(fullName).trim();
      }
      if (gender != null && String(gender).trim()) {
        payload.gender = String(gender).trim();
      }
      if (graduationYear != null) {
        const year = Number(graduationYear);
        if (Number.isInteger(year) && year >= 2020 && year <= 2040) {
          payload.graduationYear = year;
        }
      }
      if (major != null && String(major).trim()) {
        payload.major = String(major).trim();
      }
      if (academicYear != null && String(academicYear).trim()) {
        const ay = String(academicYear).trim();
        if (['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].includes(ay)) {
          payload.academicYear = ay;
        }
      }

      payload.isDatingEnabled = !!(wantsRomantic && Array.isArray(romanticPreference) && romanticPreference.length > 0);
      payload.isFriendsEnabled = !!(wantsPlatonic && Array.isArray(platonicPreference) && platonicPreference.length > 0);
      if (payload.isDatingEnabled && Array.isArray(romanticPreference)) {
        payload.datingGenderPreference = romanticPreference.slice(0, 3);
      } else {
        payload.datingGenderPreference = null;
      }
      if (payload.isFriendsEnabled && Array.isArray(platonicPreference)) {
        payload.friendsGenderPreference = platonicPreference.slice(0, 3);
      } else {
        payload.friendsGenderPreference = null;
      }

      const likesClean = trimArray(likes, 3);
      const dislikesClean = trimArray(dislikes, 3);
      if (likesClean.length > 0) payload.likes = likesClean;
      if (dislikesClean.length > 0) payload.dislikes = dislikesClean;

      const affiliationIds = Array.isArray(affiliations)
        ? affiliations.map((id) => Number(id)).filter((n) => !Number.isNaN(n) && n > 0)
        : [];
      const featuredIds = Array.isArray(featuredAffiliations)
        ? featuredAffiliations.map((id) => Number(id)).filter((n) => !Number.isNaN(n) && n > 0)
        : [];
      if (affiliationIds.length > 0) payload.affiliations = affiliationIds;
      if (featuredIds.length > 0) payload.featuredAffiliations = featuredIds.slice(0, 2);

      if (Object.keys(payload).length > 0) {
        await updateMyProfile(payload);
      }

      if (onSignedIn) {
        onSignedIn();
      }
    } catch (e) {
      const errorMessage = String(e?.message || e);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
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
                  Saving your profile…
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
