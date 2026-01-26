import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../../../styles/AuthStyles';
import { startEmailSignup } from '../../../auth/cognito';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleSignup() {
    try {
      setError('');
      setLoading(true);
      const normalizedEmail = await startEmailSignup(email, password);
      navigation.navigate('ConfirmOtp', {
        email: normalizedEmail,
        password,
      });
    } catch (e) {
      setError(String(e.message || e));
      Alert.alert('Error', String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.loginContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Entry')}
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
        >
          <Text style={styles.loginLogo}>6°</Text>
          <Text style={styles.loginTitle}>Create your account</Text>

          <Animated.View
            style={{
              width: '100%',
              marginTop: 40,
              opacity: fadeAnim,
            }}
          >
            <Text style={styles.loginLabel}>School email</Text>
            <TextInput
              style={styles.loginInput}
              value={email}
              onChangeText={setEmail}
              placeholder="you@school.edu"
              placeholderTextColor="#D0E2FF"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.loginLabel}>Password</Text>
            <TextInput
              style={styles.loginInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#D0E2FF"
              secureTextEntry
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.6 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Sending code…' : 'Send code'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 20, alignSelf: 'center' }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginFooterText}>
                Already have an account?{' '}
                <Text style={styles.loginFooterLink}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
