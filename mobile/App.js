import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabs from './navigation/BottomTabs';
import AuthScreen from './screens/AuthScreen';

export default function App() {
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        setToken(t);
      } catch (e) {
        console.warn('Failed reading token', e);
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
    <NavigationContainer>
      {token ? (
        <BottomTabs onSignOut={() => setToken(null)} />
      ) : (
        <AuthScreen onAuth={() => setToken('placeholder')} />
      )}
    </NavigationContainer>
  );
}
