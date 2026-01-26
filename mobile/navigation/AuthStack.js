import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EntryScreen from '../features/auth/screens/EntryScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import ConfirmOtpScreen from '../features/auth/screens/ConfirmOtpScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack({ onSignedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Entry" component={EntryScreen} />
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {(props) => <SignupScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
      <Stack.Screen name="ConfirmOtp">
        {(props) => <ConfirmOtpScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
