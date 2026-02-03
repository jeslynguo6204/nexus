/**
 * OnboardingTestScreen (testing only)
 *
 * Listed in the nav bar as a tab. Contains labeled buttons that navigate
 * to each stage of the profile onboarding flow for testing.
 */
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Default params so each onboarding screen can render when opened from here
const TEST_PARAMS = {
  fullName: 'Test User',
  email: 'test@seas.upenn.edu',
  password: 'testpass123',
  phoneNumber: '5551234567',
  gender: 'female',
  dateOfBirth: '2000-01-01',
  graduationYear: 2026,
  fromLogin: true,
  wantsRomantic: true,
  wantsPlatonic: true,
  romanticPreference: ['male', 'female', 'non-binary'],
  platonicPreference: ['male', 'female', 'non-binary'],
  school: 'University of Pennsylvania',
  major: 'Test Major',
  academicYear: 'Junior',
  likes: ['Sushi', 'Coffee'],
  dislikes: ['Rain'],
  affiliations: [],
  affiliationsByCategory: {},
  dorms: [],
  featuredAffiliations: null,
};

const STAGES = [
  { name: 'Welcome', screen: 'Welcome', params: { ...TEST_PARAMS } },
  { name: 'Romantic Preferences', screen: 'RomanticPreferences', params: { ...TEST_PARAMS } },
  { name: 'Platonic Preferences', screen: 'PlatonicPreferences', params: { ...TEST_PARAMS } },
  { name: 'Add Photos', screen: 'AddPhotosScreen', params: { ...TEST_PARAMS } },
  { name: 'Academics', screen: 'AcademicsScreen', params: { ...TEST_PARAMS } },
  { name: 'Likes & Dislikes', screen: 'LikesDislikesScreen', params: { ...TEST_PARAMS } },
  { name: 'Add Affiliations', screen: 'AddAffiliationsScreen', params: { ...TEST_PARAMS } },
  { name: 'Key Affiliations', screen: 'KeyAffiliationsScreen', params: { ...TEST_PARAMS } },
  { name: 'Complete Signup', screen: 'CompleteSignup', params: { ...TEST_PARAMS } },
];

export default function OnboardingTestScreen({ navigation }) {
  const root = navigation.getParent();
  const nav = root ?? navigation;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Onboarding test</Text>
        <Text style={styles.subtitle}>Tap a stage to open it (testing only)</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {STAGES.map(({ name, screen, params }) => (
          <TouchableOpacity
            key={screen}
            style={styles.button}
            onPress={() => nav.navigate(screen, params)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonLabel}>{name}</Text>
            <Text style={styles.buttonScreen}>{screen}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111',
  },
  buttonScreen: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});
