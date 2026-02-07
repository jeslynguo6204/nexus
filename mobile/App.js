import 'react-native-gesture-handler';
import React, { useEffect, useState, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, Animated, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { authStatus } from './api/authAPI';
import BottomTabs from './navigation/BottomTabs';
import AuthStack from './navigation/AuthStack';
import { ModeProvider } from './contexts/ModeContext';
import amplifyConfig from './amplifyConfig';

Amplify.configure(amplifyConfig);

// Dark blue + 6° logo screen shown during sign-out transition (matches EntryScreen look)
function SignOutTransitionScreen() {
  return (
    <LinearGradient
      colors={['#1F6299', '#34A4FF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <View style={styles.transitionContent}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>6°</Text>
        </View>
        <Text style={styles.appName}>SIXDEGREES</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  transitionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#1F6299',
    fontSize: 44,
    fontWeight: '800',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});

export default function App() {
  const [checking, setChecking] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        try {
          const status = await authStatus();
          if (status?.exists && status?.complete) {
            setIsSignedIn(true);
          } else {
            await signOut();
            setIsSignedIn(false);
          }
        } catch (statusError) {
          await signOut();
          setIsSignedIn(false);
        }
      } catch (error) {
        setIsSignedIn(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleSignOut = async () => {
    // Fade out the current screen
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(async () => {
      // After fade completes, sign out and switch to auth
      await signOut();
      setIsSignedIn(false);
      // Fade in the auth screen
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSignedIn = () => {
    // Fade in when signing in
    fadeAnim.setValue(0);
    setIsSignedIn(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={{ flex: 1 }}>
            {/* Dark blue + logo behind; visible when main content fades out */}
            <SignOutTransitionScreen />
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
              {isSignedIn ? (
                <ModeProvider>
                  <BottomTabs onSignOut={handleSignOut} />
                </ModeProvider>
              ) : (
                <AuthStack onSignedIn={handleSignedIn} />
              )}
            </Animated.View>
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
