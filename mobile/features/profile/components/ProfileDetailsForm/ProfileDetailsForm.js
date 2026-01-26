// mobile/features/profile/components/ProfileDetailsForm/ProfileDetailsForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { COLORS } from '@/styles/themeNEW';
import SelectionSheet from '@/features/profile/components/SelectionSheet';

import { getMySchoolDorms, getMySchoolAffiliations } from '@/api/affiliationsAPI';
import { getIdToken } from '@/auth/tokens';

import {
  profileToDraft,
  extractDormIdFromAffiliations,
  stripDormIds,
  normalizeIdArray,
} from './utils/profileDraft';

import { buildProfileUpdatePayload } from './utils/profilePayload';
import { sortAffiliationCategories } from './utils/affiliations';

import {
  AboutSection,
  IdentitySection,
  AcademicsSection,
  LocationSection,
  PersonalDetailsSection,
  DormSection,
  AffiliationsSection,
  FeaturedAffiliationsSection,
} from './sections';

export default function ProfileDetailsForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();

  // Draft model
  const [draft, setDraft] = useState(() => profileToDraft(profile));
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  // Remote options
  const [dorms, setDorms] = useState([]);
  const [affiliationsByCategory, setAffiliationsByCategory] = useState({});
  const [loadingAffiliations, setLoadingAffiliations] = useState(true);

  // Selection sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);

  const schoolLabel =
    profile?.school?.name ||
    profile?.school_name ||
    profile?.school?.short_name ||
    'School not set';

  const schoolId = profile?.school?.id || profile?.school_id;

  // Fetch dorms + affiliations when schoolId changes
  useEffect(() => {
    (async () => {
      if (!schoolId) {
        setLoadingAffiliations(false);
        return;
      }

      setLoadingAffiliations(true);
      try {
        const token = await getIdToken();
        if (!token) {
          setLoadingAffiliations(false);
          return;
        }

        const [dormsData, affiliationsData] = await Promise.all([
          getMySchoolDorms(token).catch(() => []),
          getMySchoolAffiliations(token).catch(() => ({})),
        ]);

        setDorms(Array.isArray(dormsData) ? dormsData : []);
        setAffiliationsByCategory(affiliationsData || {});

        // Split dorm out of draft affiliations once dorm list is known
        setDraft((prev) => {
          const dormId = extractDormIdFromAffiliations(prev.affiliations, dormsData);
          const nonDorm = stripDormIds(prev.affiliations, dormsData);
          return {
            ...prev,
            dormId: dormId ?? prev.dormId,
            affiliations: normalizeIdArray(nonDorm),
          };
        });
      } finally {
        setLoadingAffiliations(false);
      }
    })();
  }, [schoolId]);

  const sortedAffiliationEntries = useMemo(() => {
    return sortAffiliationCategories(affiliationsByCategory);
  }, [affiliationsByCategory]);

  function openSelectionSheet(config) {
    setSheetConfig(config);
    setSheetVisible(true);
  }

  function closeSelectionSheet() {
    setSheetVisible(false);
    setSheetConfig(null);
  }

  function submit() {
    try {
      const payload = buildProfileUpdatePayload(profile, draft);
      onSave(payload);
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      if (__DEV__) console.warn('ProfileDetailsForm submit error:', e);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
        >
          <FontAwesome name="times" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={submit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ paddingHorizontal: 4, paddingVertical: 4 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.textPrimary }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AboutSection draft={draft} setField={setField} />

        <IdentitySection
          draft={draft}
          setField={setField}
          openSelectionSheet={openSelectionSheet}
        />

        <AcademicsSection
          draft={draft}
          setField={setField}
          schoolLabel={schoolLabel}
        />

        <LocationSection draft={draft} setField={setField} />

        <PersonalDetailsSection
          draft={draft}
          setField={setField}
          openSelectionSheet={openSelectionSheet}
        />

        <DormSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          loading={loadingAffiliations}
          openSelectionSheet={openSelectionSheet}
        />

        <AffiliationsSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          loading={loadingAffiliations}
          sortedAffiliationEntries={sortedAffiliationEntries}
          openSelectionSheet={openSelectionSheet}
        />

        <FeaturedAffiliationsSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          affiliationsByCategory={affiliationsByCategory}
        />
      </ScrollView>

      {/* Selection sheet */}
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
    </View>
  );
}
