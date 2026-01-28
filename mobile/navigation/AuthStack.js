import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EntryScreen from '../features/auth/screens/EntryScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import SignupStep1Screen from '../features/auth/screens/SignupStep1Screen';
import SignupStep2Screen from '../features/auth/screens/SignupStep2Screen';
import SignupStep3Screen from '../features/auth/screens/SignupStep3Screen';
import ConfirmOtpScreen from '../features/auth/screens/ConfirmOtpScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack({ onSignedIn }) {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#1F6299' },
      }}
    >
      <Stack.Screen name="Entry" component={EntryScreen} />
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Signup">
        {(props) => <SignupScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
      <Stack.Screen name="SignupStep1" component={SignupStep1Screen} />
      <Stack.Screen name="SignupStep2" component={SignupStep2Screen} />
      <Stack.Screen name="SignupStep3" component={SignupStep3Screen} />
      <Stack.Screen name="ConfirmOtp">
        {(props) => <ConfirmOtpScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
