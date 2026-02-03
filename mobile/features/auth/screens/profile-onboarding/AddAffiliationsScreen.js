/**
 * AddAffiliationsScreen (Section 5.1)
 *
 * Profile onboarding: add affiliations from backend categories (affiliation_categories)
 * and affiliations tables. Fetches via getMySchoolAffiliations (same as edit profile).
 * Categories shown in scroll; tapping a category opens a selector to pick specific
 * affiliations within that category (same single/multi rules as edit profile).
 * Reached from LikesDislikesScreen. On continue navigates to KeyAffiliationsScreen
 * with selected affiliation IDs and affiliationsByCategory for display.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { getMySchoolDorms, getMySchoolAffiliations } from '../../../../api/affiliationsAPI';
import { getIdToken } from '../../../../auth/tokens';
import { login } from '../../../../auth/cognito';
import { sortAffiliationCategories } from '../../../profile/components/ProfileDetailsForm/utils/affiliations';
import SelectionSheet from '../../../profile/components/SelectionSheet';

function isDormAffiliationId(id, dorms) {
  const n = Number(id);
  return (dorms || []).some((d) => Number(d.id) === n);
}

function categoryIsSingleSelect(categoryName) {
  const lower = String(categoryName || '').toLowerCase();
  return lower.includes('greek') || lower.includes('house');
}

export default function AddAffiliationsScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [dorms, setDorms] = useState([]);
  const [affiliationsByCategory, setAffiliationsByCategory] = useState({});
  const routeParams = route.params || {};
  const backPayloadRef = useRef({});
  const initialAffiliationIds = Array.isArray(routeParams.affiliations)
    ? routeParams.affiliations.map((id) => Number(id)).filter((n) => !Number.isNaN(n) && n > 0)
    : [];
  const [selectedAffiliationIds, setSelectedAffiliationIds] = useState(initialAffiliationIds);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  async function fetchAffiliations() {
    setLoading(true);
    setFetchError(null);
    try {
      let token = await getIdToken();
      if (!token && routeParams.email && routeParams.password) {
        try {
          await login(routeParams.email, routeParams.password);
          token = await getIdToken();
        } catch (e) {
          setFetchError('Please sign in again to load affiliations.');
          return;
        }
      }
      if (!token) {
        setFetchError('You need to be signed in to load affiliations.');
        return;
      }
      const [dormsData, affiliationsData] = await Promise.all([
        getMySchoolDorms(token).catch(() => []),
        getMySchoolAffiliations(token).catch(() => ({})),
      ]);
      setDorms(Array.isArray(dormsData) ? dormsData : []);
      setAffiliationsByCategory(affiliationsData || {});
    } catch (e) {
      setFetchError(e?.message || 'Failed to load affiliations. Tap Retry.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAffiliations();
  }, [routeParams.email, routeParams.password]);

  const sortedAffiliationEntries = useMemo(
    () => sortAffiliationCategories(affiliationsByCategory),
    [affiliationsByCategory]
  );

  function openSelectionSheet(config) {
    setSheetConfig(config);
    setSheetVisible(true);
  }

  function closeSelectionSheet() {
    setSheetVisible(false);
    setSheetConfig(null);
  }

  function handleContinue() {
    navigation.navigate('KeyAffiliationsScreen', {
      ...routeParams,
      ...backPayloadRef.current,
      affiliations: selectedAffiliationIds,
      affiliationsByCategory,
      dorms,
      onBackWithData: (data) => { backPayloadRef.current = data; },
    });
  }

  function handleSkip() {
    navigation.navigate('KeyAffiliationsScreen', {
      ...routeParams,
      ...backPayloadRef.current,
      onBackWithData: (data) => { backPayloadRef.current = data; },
    });
  }

  function handleBack() {
    routeParams.onBackWithData?.({
      affiliations: selectedAffiliationIds,
      affiliationsByCategory,
      dorms,
    });
    navigation.goBack();
  }

  if (loading && !fetchError) {
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

  if (fetchError && sortedAffiliationEntries.length === 0) {
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
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 16, color: '#E5E7EB', textAlign: 'center', marginBottom: 16 }}>
              {fetchError}
            </Text>
            <TouchableOpacity
              onPress={() => fetchAffiliations()}
              style={[styles.entryPrimaryButton, { marginTop: 8 }]}
              activeOpacity={0.9}
            >
              <Text style={styles.entryPrimaryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
              <Text style={styles.entryTagline}>Affiliations</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 8 }}>
                Add anything you&apos;re involved in.
              </Text>
              <Text style={{ fontSize: 12, color: '#C5D0DC', textAlign: 'center', marginBottom: 24 }}>
                Tap a category to pick specific affiliations. Same rules as edit profile.
              </Text>

              {sortedAffiliationEntries.length === 0 ? (
                <Text style={{ fontSize: 14, color: '#C5D0DC', textAlign: 'center', marginBottom: 24 }}>
                  No categories available for your school.
                </Text>
              ) : (
                <View style={{ marginBottom: 20 }}>
                  {sortedAffiliationEntries.map(([categoryName, categoryAffiliations]) => {
                    const nonDormOptions = (categoryAffiliations || []).filter(
                      (a) => !isDormAffiliationId(a?.id, dorms)
                    );
                    if (nonDormOptions.length === 0) return null;

                    const single = categoryIsSingleSelect(categoryName);
                    const selectedForCategory = single
                      ? (selectedAffiliationIds.find((id) =>
                          nonDormOptions.some((a) => Number(a.id) === Number(id))
                        ) ?? null)
                      : selectedAffiliationIds.filter((id) =>
                          nonDormOptions.some((a) => Number(a.id) === Number(id))
                        );

                    const displayValue = single
                      ? (selectedForCategory
                          ? (nonDormOptions.find((a) => Number(a.id) === Number(selectedForCategory))?.name || '')
                          : '')
                      : Array.isArray(selectedForCategory) && selectedForCategory.length > 0
                        ? selectedForCategory
                            .map((id) =>
                              nonDormOptions.find((a) => Number(a.id) === Number(id))?.name
                            )
                            .filter(Boolean)
                            .join(', ')
                        : '';

                    return (
                      <TouchableOpacity
                        key={categoryName}
                        onPress={() =>
                          openSelectionSheet({
                            title: categoryName,
                            options: nonDormOptions,
                            selected: selectedForCategory,
                            allowMultiple: !single,
                            allowUnselect: true,
                            onSelect: (value) => {
                              const otherIds = selectedAffiliationIds.filter(
                                (id) => !nonDormOptions.some((a) => Number(a.id) === Number(id))
                              );
                              if (single) {
                                setSelectedAffiliationIds(value ? [...otherIds, Number(value)] : otherIds);
                              } else {
                                const nextIds = Array.isArray(value)
                                  ? value.map(Number)
                                  : value ? [Number(value)] : [];
                                setSelectedAffiliationIds([...otherIds, ...nextIds]);
                              }
                            },
                          })
                        }
                        style={{
                          backgroundColor: displayValue ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                          borderWidth: 1,
                          borderColor: displayValue ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
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
                          {categoryName}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{ color: '#E5F2FF', fontSize: 14, flex: 1, marginLeft: 8, textAlign: 'right' }}
                        >
                          {displayValue || 'Not selected'}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginLeft: 4 }}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

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

      {sheetConfig && (
        <SelectionSheet
          visible={sheetVisible}
          title={sheetConfig.title}
          options={sheetConfig.options}
          selected={sheetConfig.selected}
          allowMultiple={sheetConfig.allowMultiple}
          allowUnselect={sheetConfig.allowUnselect}
          onSelect={sheetConfig.onSelect}
          onClose={closeSelectionSheet}
        />
      )}
    </LinearGradient>
  );
}
