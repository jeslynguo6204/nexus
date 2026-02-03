/**
 * MainStack – Root stack when signed in.
 * Contains MainTabs (BottomTabs) first, then onboarding screens so the
 * Onboarding Test tab can navigate to each stage for testing.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
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

export default function MainStack({ onSignOut, onSignedIn }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1F6299' },
      }}
    >
      <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
        {(props) => <BottomTabs {...props} onSignOut={onSignOut} />}
      </Stack.Screen>
      <Stack.Screen name="Welcome">
        {(props) => <WelcomeScreen {...props} onSignedIn={onSignedIn} />}
      </Stack.Screen>
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
