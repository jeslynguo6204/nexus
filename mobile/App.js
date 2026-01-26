import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import BottomTabs from './navigation/BottomTabs';
import AuthStack from './navigation/AuthStack';
import amplifyConfig from './amplifyConfig';

Amplify.configure(amplifyConfig);

export default function App() {
  const [checking, setChecking] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await getCurrentUser();
        setIsSignedIn(true);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isSignedIn ? (
            <BottomTabs
              onSignOut={async () => {
                await signOut();
                setIsSignedIn(false);
              }}
            />
          ) : (
            <AuthStack
              onSignedIn={() => {
                setIsSignedIn(true);
              }}
            />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
