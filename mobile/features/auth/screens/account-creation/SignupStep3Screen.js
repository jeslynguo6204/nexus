/**
 * SignupStep3Screen
 *
 * Optional third step in an alternate signup path: dating/friends preferences
 * (who you want to meet). May be used in a flow that goes Step1 → Step2 →
 * Step3 → ... before OTP. Check navigator usage; current primary flow is
 * Step1 → Step2 → ConfirmOtp → Welcome → Romantic/Platonic → CompleteSignup.
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
import styles from '../../../../styles/AuthStyles.v2';
import { startEmailSignup } from '../../../../auth/cognito';

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

export default function SignupStep3Screen({ navigation, route }) {
  // Dating: make it single-select
  const [dating, setDating] = useState(''); // '', 'men', 'women', 'nonBinary', 'everyone', 'notLooking'

  // Friends: multi-select
  const [friendsMen, setFriendsMen] = useState(true);
  const [friendsWomen, setFriendsWomen] = useState(true);
  const [friendsNonBinary, setFriendsNonBinary] = useState(true);
  const friendsEveryone = friendsMen && friendsWomen && friendsNonBinary;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fullName, email, phoneNumber, password, gender, dateOfBirth, graduationYear } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  // Convert dating preference to backend format
  const getDatingPreference = () => {
    if (dating === 'notLooking' || dating === '') {
      return null; // Not looking - will be handled separately
    }
    if (dating === 'everyone') {
      return 'everyone';
    }
    if (dating === 'men') {
      return 'male';
    }
    if (dating === 'women') {
      return 'female';
    }
    if (dating === 'nonBinary') {
      return 'non-binary';
    }
    return null;
  };

  // Convert friends preference to backend format
  const getFriendsPreference = () => {
    if (friendsEveryone) {
      return 'everyone';
    }
    // If only one is selected
    if (friendsMen && !friendsWomen && !friendsNonBinary) {
      return 'male';
    }
    if (friendsWomen && !friendsMen && !friendsNonBinary) {
      return 'female';
    }
    if (friendsNonBinary && !friendsMen && !friendsWomen) {
      return 'non-binary';
    }
    // If multiple but not all, default to everyone
    return 'everyone';
  };

  async function handleCreateAccount() {
    try {
      setError('');
      setLoading(true);

      const normalizedEmail = await startEmailSignup(email, password);

      const datingPreference = getDatingPreference();
      const friendsPreference = getFriendsPreference();

      navigation.navigate('ConfirmOtp', {
        fullName,
        email: normalizedEmail,
        phoneNumber,
        password,
        gender,
        dateOfBirth,
        graduationYear,
        datingPreferences: {
          preference: datingPreference,
          notLooking: dating === 'notLooking' || dating === '',
        },
        friendsPreferences: {
          preference: friendsPreference,
        },
      });
    } catch (e) {
      const errorMessage = String(e.message || e);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.loginContainer} edges={['top', 'left', 'right']}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.loginBackButton, { top: insets.top + 4 }]}
      >
        <Text style={styles.loginBackText}>← Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.loginLogo}>6°</Text>
          <Text style={styles.loginTitle}>What are you looking for?</Text>
          <Text style={styles.loginSubtitle}>You can change this anytime.</Text>

          <Animated.View style={{ width: '100%', marginTop: 24, opacity: fadeAnim }}>
            {/* Dating block */}
            <View style={styles.preferenceCard}>
              <Text style={styles.preferenceTitle}>Dating</Text>
              <Text style={styles.preferenceHint}>Pick one</Text>

              <View style={styles.chipWrap}>
                <SelectChip
                  label="Not looking"
                  selected={dating === 'notLooking' || dating === ''}
                  onPress={() => setDating('notLooking')}
                />
                <SelectChip
                  label="Men"
                  selected={dating === 'men'}
                  onPress={() => setDating('men')}
                />
                <SelectChip
                  label="Women"
                  selected={dating === 'women'}
                  onPress={() => setDating('women')}
                />
                <SelectChip
                  label="Non-Binary"
                  selected={dating === 'nonBinary'}
                  onPress={() => setDating('nonBinary')}
                />
                <SelectChip
                  label="Everyone"
                  selected={dating === 'everyone'}
                  onPress={() => setDating('everyone')}
                />
              </View>
            </View>

            {/* Friends block */}
            <View style={styles.preferenceCard}>
              <Text style={styles.preferenceTitle}>Friends</Text>
              <Text style={styles.preferenceHint}>Select all that apply</Text>

              <View style={styles.chipWrap}>
                <SelectChip
                  label="Men"
                  selected={friendsMen}
                  onPress={() => setFriendsMen((v) => !v)}
                />
                <SelectChip
                  label="Women"
                  selected={friendsWomen}
                  onPress={() => setFriendsWomen((v) => !v)}
                />
                <SelectChip
                  label="Non-Binary"
                  selected={friendsNonBinary}
                  onPress={() => setFriendsNonBinary((v) => !v)}
                />
                <SelectChip
                  label="Everyone"
                  selected={friendsEveryone}
                  onPress={() => {
                    const next = !friendsEveryone;
                    setFriendsMen(next);
                    setFriendsWomen(next);
                    setFriendsNonBinary(next);
                  }}
                />
              </View>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Creating account…' : 'Create account'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
