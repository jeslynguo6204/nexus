import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EntryScreen from '../features/auth/screens/EntryScreen';
import LoginScreen from '../features/auth/screens/existing-users/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import SignupStep1Screen from '../features/auth/screens/account-creation/SignupStep1Screen';
import SignupStep2Screen from '../features/auth/screens/account-creation/SignupStep2Screen';
import ConfirmOtpScreen from '../features/auth/screens/account-creation/ConfirmOtpScreen';
import ForgotPasswordScreen from '../features/auth/screens/existing-users/ForgotPasswordScreen';
import WelcomeScreen from '../features/auth/screens/profile-onboarding/WelcomeScreen';
import RomanticPreferencesScreen from '../features/auth/screens/profile-onboarding/RomanticPreferencesScreen';
import PlatonicPreferencesScreen from '../features/auth/screens/profile-onboarding/PlatonicPreferencesScreen';
import AddPhotosScreen from '../features/auth/screens/profile-onboarding/AddPhotosScreen';
import AcademicsScreen from '../features/auth/screens/profile-onboarding/AcademicsScreen';
import LikesDislikesScreen from '../features/auth/screens/profile-onboarding/LikesDislikesScreen';
import AddAffiliationsScreen from '../features/auth/screens/profile-onboarding/AddAffiliationsScreen';
import KeyAffiliationsScreen from '../features/auth/screens/profile-onboarding/KeyAffiliationsScreen';
import CompleteSignupScreen from '../features/auth/screens/CompleteSignupScreen';

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
      <Stack.Screen name="ConfirmOtp">
        {(props) => <ConfirmOtpScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RomanticPreferences" component={RomanticPreferencesScreen} />
      <Stack.Screen name="PlatonicPreferences" component={PlatonicPreferencesScreen} />
      <Stack.Screen name="AddPhotosScreen" component={AddPhotosScreen} />
      <Stack.Screen name="AcademicsScreen" component={AcademicsScreen} />
      <Stack.Screen name="LikesDislikesScreen" component={LikesDislikesScreen} />
      <Stack.Screen name="AddAffiliationsScreen" component={AddAffiliationsScreen} />
      <Stack.Screen name="KeyAffiliationsScreen" component={KeyAffiliationsScreen} />
      <Stack.Screen name="CompleteSignup">
        {(props) => <CompleteSignupScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
