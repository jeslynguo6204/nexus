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
import styles from '../../../styles/AuthStyles.v2';
import { startEmailSignup } from '../../../auth/cognito';

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
  const [dating, setDating] = useState(''); // '', 'men', 'women', 'everyone', 'notLooking'

  // Friends: multi-select
  const [friendsMen, setFriendsMen] = useState(true);
  const [friendsWomen, setFriendsWomen] = useState(true);
  const friendsEveryone = friendsMen && friendsWomen;

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

  async function handleCreateAccount() {
    try {
      setError('');
      setLoading(true);

      const normalizedEmail = await startEmailSignup(email, password);

      navigation.navigate('ConfirmOtp', {
        fullName,
        email: normalizedEmail,
        phoneNumber,
        password,
        gender,
        dateOfBirth,
        graduationYear,
        datingPreferences: {
          men: dating === 'men' || dating === 'everyone',
          women: dating === 'women' || dating === 'everyone',
          everyone: dating === 'everyone',
          notLooking: dating === 'notLooking' || dating === '',
        },
        friendsPreferences: {
          men: friendsMen,
          women: friendsWomen,
          everyone: friendsMen && friendsWomen,
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
                  label="Everyone"
                  selected={friendsEveryone}
                  onPress={() => {
                    const next = !friendsEveryone;
                    setFriendsMen(next);
                    setFriendsWomen(next);
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
