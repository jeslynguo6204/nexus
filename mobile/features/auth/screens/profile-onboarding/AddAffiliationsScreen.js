/**
 * AddAffiliationsScreen (Section 5.1)
 *
 * Profile onboarding: add affiliations from predefined categories.
 * Reached from LikesDislikesScreen. On continue navigates to KeyAffiliationsScreen.
 * Note: Full affiliation selection happens post-signup; during onboarding, this is informational.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../../../styles/AuthStyles';

const AFFILIATION_CATEGORIES = [
  'Greek Life',
  'Sports & Recreation',
  'Arts & Culture',
  'Academic Clubs',
  'Service & Social Impact',
  'Religious & Spiritual',
  'Professional Organizations',
  'Hobbies & Interests',
];

function AffiliationCategory({ category, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: selected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: selected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
        {category}
      </Text>
      {selected && (
        <Text style={{ color: '#E5F2FF', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
      )}
    </TouchableOpacity>
  );
}

function AffiliationSelector({ category, affiliations, selectedIds, onToggle, onClose }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(31,98,153,0.95)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 32,
        maxHeight: '80%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>
          {category}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ fontSize: 24, color: '#E5F2FF', fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 13, color: '#C5D0DC', marginBottom: 16 }}>
          Affiliations will be fully available after you complete your account setup.
        </Text>
      </ScrollView>
    </View>
  );
}

export default function AddAffiliationsScreen({ navigation, route }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const routeParams = route.params || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function handleToggleCategory(category) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  }

  function handleContinue() {
    navigation.navigate('KeyAffiliationsScreen', {
      ...routeParams,
      selectedAffiliations: selectedCategories,
    });
  }

  if (loading) {
    return (
      <LinearGradient
        colors={['#1F6299', '#34A4FF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator color="#FFFFFF" size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1F6299', '#34A4FF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.entryContainer} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <Text style={styles.entryTagline}>Affiliations</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 8 }}>
                Add anything you're involved in at Penn.
              </Text>
              <Text style={{ fontSize: 12, color: '#C5D0DC', textAlign: 'center', marginBottom: 24 }}>
                This isn't a resume — add as many or as few as you want.
              </Text>

              <View style={{ marginBottom: 20 }}>
                {AFFILIATION_CATEGORIES.map(category => (
                  <AffiliationCategory
                    key={category}
                    category={category}
                    selected={selectedCategories.includes(category)}
                    onPress={() => handleToggleCategory(category)}
                  />
                ))}
              </View>

              <View style={{ alignItems: 'center', width: '100%' }}>
                <TouchableOpacity
                  style={styles.entryPrimaryButton}
                  onPress={handleContinue}
                  activeOpacity={0.9}
                >
                  <Text style={styles.entryPrimaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
