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
import styles from '../../../styles/AuthStyles';
import { startEmailSignup } from '../../../auth/cognito';

export default function SignupStep3Screen({ navigation, route }) {
  const [datingMen, setDatingMen] = useState(false);
  const [datingWomen, setDatingWomen] = useState(false);
  const [datingEveryone, setDatingEveryone] = useState(false);
  const [datingNotLooking, setDatingNotLooking] = useState(false);
  
  const [friendsMen, setFriendsMen] = useState(true);
  const [friendsWomen, setFriendsWomen] = useState(true);
  // "Everyone" is derived from both Men and Women being checked
  const friendsEveryone = friendsMen && friendsWomen;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { fullName, email, phoneNumber, password, gender, dateOfBirth, graduationYear } = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const Checkbox = ({ checked, onPress, label }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: checked ? '#FFFFFF' : '#D0E2FF',
          borderRadius: 4,
          backgroundColor: checked ? '#FFFFFF' : 'transparent',
          marginRight: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked && (
          <Text style={{ color: '#1F6299', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
        )}
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );

  async function handleCreateAccount() {
    try {
      setError('');
      setLoading(true);
      
      // Create Cognito user and send verification code
      const normalizedEmail = await startEmailSignup(email, password);
      
      // Navigate to verification screen with all collected data
      navigation.navigate('ConfirmOtp', {
        fullName,
        email: normalizedEmail,
        phoneNumber,
        password,
        gender,
        dateOfBirth,
        graduationYear,
        datingPreferences: {
          men: datingMen,
          women: datingWomen,
          everyone: datingEveryone,
          notLooking: datingNotLooking,
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.loginLogo}>6°</Text>
          <Text style={styles.loginTitle}>What are you looking for?</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 10,
              opacity: fadeAnim,
            }}
          >
            <Text style={[styles.loginLabel, { marginTop: 12, marginBottom: 12 }]}>I'm open to...</Text>
            
            <View style={{ marginBottom: 24 }}>
              <Text style={[styles.loginLabel, { marginBottom: 12, fontSize: 15 }]}>Dating</Text>
              <Checkbox
                checked={datingMen}
                onPress={() => {
                  setDatingMen(!datingMen);
                  if (!datingMen) {
                    setDatingNotLooking(false);
                  }
                }}
                label="Men"
              />
              <Checkbox
                checked={datingWomen}
                onPress={() => {
                  setDatingWomen(!datingWomen);
                  if (!datingWomen) {
                    setDatingNotLooking(false);
                  }
                }}
                label="Women"
              />
              <Checkbox
                checked={datingEveryone}
                onPress={() => {
                  setDatingEveryone(!datingEveryone);
                  if (datingEveryone) {
                    setDatingMen(false);
                    setDatingWomen(false);
                  }
                  setDatingNotLooking(false);
                }}
                label="Everyone"
              />
              <Checkbox
                checked={datingNotLooking}
                onPress={() => {
                  setDatingNotLooking(!datingNotLooking);
                  if (!datingNotLooking) {
                    setDatingMen(false);
                    setDatingWomen(false);
                    setDatingEveryone(false);
                  }
                }}
                label="Not looking to date"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={[styles.loginLabel, { marginBottom: 12, fontSize: 15 }]}>Friends</Text>
              <Checkbox
                checked={friendsMen}
                onPress={() => setFriendsMen(!friendsMen)}
                label="Men"
              />
              <Checkbox
                checked={friendsWomen}
                onPress={() => setFriendsWomen(!friendsWomen)}
                label="Women"
              />
              <Checkbox
                checked={friendsEveryone}
                onPress={() => {
                  // Toggle both Men and Women when "Everyone" is toggled
                  const newValue = !friendsEveryone;
                  setFriendsMen(newValue);
                  setFriendsWomen(newValue);
                }}
                label="Everyone"
              />
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

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
