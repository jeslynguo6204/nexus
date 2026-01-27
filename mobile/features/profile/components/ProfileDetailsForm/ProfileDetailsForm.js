import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '@/styles/themeNEW';
import editProfileStyles from '@/styles/EditProfileStyles';
import SelectionSheet from '@/features/profile/components/SelectionSheet';

import { getMySchoolDorms, getMySchoolAffiliations } from '@/api/affiliationsAPI';

import {
  profileToDraft,
  extractDormIdFromAffiliations,
  stripDormIds,
  normalizeIdArray,
} from './utils/profileDraft';

import { buildProfileUpdatePayload } from './utils/profilePayload';
import { sortAffiliationCategories } from './utils/affiliations';

import {
  Section1About,
  AcademicsSection,
  LocationSection,
  PersonalDetailsSection,
  DormSection,
  AffiliationsSection,
  FeaturedAffiliationsSection,
} from './sections';
import { EditProfileSectionHeader } from '@/features/profile/components/form-editor-components';
import LikesDislikesEditModal from './LikesDislikesEditModal';
import BioEditModal from './BioEditModal';

function pad3(arr) {
  const a = Array.isArray(arr) ? arr.slice(0, 3) : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

export default function ProfileDetailsForm({
  profile,
  onSave,
  onClose,
  primaryPhotoUrl,
  onEditPhoto,
  photoBusy = false,
}) {
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState(() => profileToDraft(profile));
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const [dorms, setDorms] = useState([]);
  const [affiliationsByCategory, setAffiliationsByCategory] = useState({});
  const [loadingAffiliations, setLoadingAffiliations] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);
  const [likesEditVisible, setLikesEditVisible] = useState(false);
  const [dislikesEditVisible, setDislikesEditVisible] = useState(false);
  const [bioEditVisible, setBioEditVisible] = useState(false);

  const schoolLabel =
    profile?.school?.name ||
    profile?.school_name ||
    profile?.school?.short_name ||
    'School not set';
  const schoolId = profile?.school?.id || profile?.school_id;

  useEffect(() => {
    (async () => {
      if (!schoolId) {
        setLoadingAffiliations(false);
        return;
      }
      setLoadingAffiliations(true);
      try {
        const token = await AsyncStorage.getItem('token');
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

  function onLikesDone(values) {
    setField('likes', values);
    setLikesEditVisible(false);
  }

  function onDislikesDone(values) {
    setField('dislikes', values);
    setDislikesEditVisible(false);
  }

  function onBioDone(value) {
    setField('bio', value ?? '');
    setBioEditVisible(false);
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
    <View style={[editProfileStyles.container, { paddingTop: insets.top }]}>
      {/* Header: back | Edit profile | Save */}
      <View style={editProfileStyles.header}>
        <TouchableOpacity
          style={editProfileStyles.headerBack}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="chevron-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={editProfileStyles.headerTitle}>Edit profile</Text>
        <TouchableOpacity
          style={editProfileStyles.headerSave}
          onPress={submit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={editProfileStyles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile photo block */}
        {typeof onEditPhoto === 'function' && (
          <TouchableOpacity
            style={[editProfileStyles.photoBlock, photoBusy && { opacity: 0.5 }]}
            onPress={onEditPhoto}
            disabled={photoBusy}
            activeOpacity={0.8}
          >
            {primaryPhotoUrl ? (
              <Image
                source={{ uri: primaryPhotoUrl }}
                style={editProfileStyles.avatarImage}
              />
            ) : (
              <View style={editProfileStyles.avatar} />
            )}
            <View style={editProfileStyles.editPhotoLink}>
              <Text style={editProfileStyles.editPhotoLinkText}>
                Edit picture or avatar
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Section 1: About you */}
        <Section1About
          draft={draft}
          setField={setField}
          openSelectionSheet={openSelectionSheet}
          onOpenBio={() => setBioEditVisible(true)}
          onOpenLikes={() => setLikesEditVisible(true)}
          onOpenDislikes={() => setDislikesEditVisible(true)}
          first
        />

        {/* Section 2: Academics */}
        <EditProfileSectionHeader title="Academics" />
        <AcademicsSection
          draft={draft}
          setField={setField}
          schoolLabel={schoolLabel}
        />

        {/* Section 3: Location & details */}
        <EditProfileSectionHeader title="Location & details" />
        <LocationSection draft={draft} setField={setField} />
        <PersonalDetailsSection
          draft={draft}
          setField={setField}
          openSelectionSheet={openSelectionSheet}
        />

        {/* Section 4: Affiliations */}
        <EditProfileSectionHeader title="Affiliations" />
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

        {/* Section 5: Key affiliations (header inside section when has content) */}
        <FeaturedAffiliationsSection
          draft={draft}
          setField={setField}
          dorms={dorms}
          affiliationsByCategory={affiliationsByCategory}
        />
      </ScrollView>

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

      <BioEditModal
        visible={bioEditVisible}
        value={draft.bio}
        onDone={onBioDone}
        onClose={() => setBioEditVisible(false)}
      />
      <LikesDislikesEditModal
        visible={likesEditVisible}
        mode="likes"
        values={pad3(draft.likes)}
        onDone={onLikesDone}
        onClose={() => setLikesEditVisible(false)}
      />
      <LikesDislikesEditModal
        visible={dislikesEditVisible}
        mode="dislikes"
        values={pad3(draft.dislikes)}
        onDone={onDislikesDone}
        onClose={() => setDislikesEditVisible(false)}
      />
    </View>
  );
}
