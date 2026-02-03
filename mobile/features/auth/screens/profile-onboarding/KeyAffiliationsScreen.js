/**
 * KeyAffiliationsScreen (Section 5.2)
 *
 * Profile onboarding: select up to 2 key affiliations to highlight.
 * Same logic as edit profile Key Affiliations: shows all selected affiliations
 * (from AddAffiliationsScreen), user picks up to 2 as "featured".
 * Reached from AddAffiliationsScreen with affiliations (IDs), affiliationsByCategory, dorms.
 * On continue navigates to CompleteSignup with affiliations and featuredAffiliations.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
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

function isDormAffiliationId(id, dorms) {
  const n = Number(id);
  return (dorms || []).some((d) => Number(d.id) === n);
}

function AffiliationChip({ affiliation, selected, disabled, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: selected ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>
        {affiliation.name}
      </Text>
      {selected && (
        <Text style={{ color: '#E5F2FF', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
      )}
    </TouchableOpacity>
  );
}

export default function KeyAffiliationsScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const selectedIds = routeParams.affiliations || routeParams.selectedAffiliations || [];
  const affiliationsByCategory = routeParams.affiliationsByCategory || {};
  const dorms = routeParams.dorms || [];
  const initialFeatured = Array.isArray(routeParams.featuredAffiliations)
    ? routeParams.featuredAffiliations.map(Number).filter((n) => !Number.isNaN(n) && n > 0)
    : [];
  const [featuredAffiliations, setFeaturedAffiliations] = useState(initialFeatured);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const selectedAffiliations = useMemo(() => {
    const map = new Map();
    Object.values(affiliationsByCategory || {}).forEach((list) => {
      (list || []).forEach((aff) => {
        if (!aff?.id) return;
        const id = Number(aff.id);
        if (isDormAffiliationId(id, dorms)) return;
        if (selectedIds.some((x) => Number(x) === id)) map.set(id, aff);
      });
    });
    return selectedIds.map((id) => map.get(Number(id))).filter(Boolean);
  }, [affiliationsByCategory, dorms, selectedIds]);

  const featuredSet = useMemo(
    () => new Set(featuredAffiliations.map(Number)),
    [featuredAffiliations]
  );

  useEffect(() => {
    const next = Array.isArray(routeParams.featuredAffiliations)
      ? routeParams.featuredAffiliations.map(Number).filter((n) => !Number.isNaN(n) && n > 0)
      : [];
    if (next.length > 0) setFeaturedAffiliations(next);
  }, [routeParams.featuredAffiliations]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function handleToggleFeatured(id) {
    const idNum = Number(id);
    const exists = featuredSet.has(idNum);
    if (exists) {
      setFeaturedAffiliations((prev) => prev.filter((x) => Number(x) !== idNum));
      return;
    }
    if (featuredAffiliations.length >= 2) {
      Alert.alert('Limit reached', 'You can only select up to 2 key affiliations.');
      return;
    }
    setFeaturedAffiliations((prev) => [...prev, idNum]);
  }

  function handleContinue() {
    navigation.navigate('CompleteSignup', {
      ...routeParams,
      affiliations: selectedIds,
      featuredAffiliations: featuredAffiliations.length > 0 ? featuredAffiliations : null,
    });
  }

  function handleSkip() {
    navigation.navigate('CompleteSignup', { ...routeParams });
  }

  function handleBack() {
    navigation.navigate('AddAffiliationsScreen', {
      ...routeParams,
      affiliations: selectedIds,
      featuredAffiliations: featuredAffiliations.length > 0 ? featuredAffiliations : null,
    });
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
          onPress={handleBack}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          style={{ position: 'absolute', right: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>Skip →</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <Text style={styles.entryTagline}>Key affiliations</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 24 }}>
                Choose up to two to highlight on your profile.
              </Text>

              <Text style={{ fontSize: 13, color: '#C5D0DC', marginBottom: 12 }}>
                These show up front — you can change them anytime.
              </Text>

              {selectedAffiliations.length === 0 ? (
                <View style={{ marginTop: 32, alignItems: 'center' }}>
                  <Text style={{ color: '#C5D0DC', fontSize: 14 }}>
                    No affiliations selected. Go back and add some!
                  </Text>
                </View>
              ) : (
                <View style={{ marginBottom: 20, marginTop: 16 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedAffiliations.map((aff) => {
                      const id = Number(aff.id);
                      const isSelected = featuredSet.has(id);
                      const disabled = !isSelected && featuredAffiliations.length >= 2;
                      return (
                        <AffiliationChip
                          key={String(aff.id)}
                          affiliation={aff}
                          selected={isSelected}
                          disabled={disabled}
                          onPress={() => handleToggleFeatured(id)}
                        />
                      );
                    })}
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      color: '#C5D0DC',
                      marginTop: 16,
                      fontStyle: 'italic',
                    }}
                  >
                    Selected: {featuredAffiliations.length} / 2
                  </Text>
                </View>
              )}

              <View style={{ alignItems: 'center', width: '100%', marginTop: 'auto' }}>
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
