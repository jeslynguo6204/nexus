import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { COLORS } from '@/styles/themeNEW';
import editProfileStyles from '@/styles/EditProfileStyles';
import SelectionSheet from '@/features/profile/components/SelectionSheet';

import ModesSection from './sections/ModesSection';
import GenderPreferenceSection from './sections/GenderPreferenceSection';
import AgeRangeSection from './sections/AgeRangeSection';
import DistanceSection from './sections/DistanceSection';

import { preferencesFromProfile } from './utils/preferencesDraft';
import { buildPreferencesUpdatePayload } from './utils/preferencesPayload';

export default function ProfilePreferencesForm({
  profile,
  onSave,
  onClose,
  onLogOut,
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(() => preferencesFromProfile(profile));
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);

  useEffect(() => {
    setDraft(preferencesFromProfile(profile));
  }, [profile]);

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
      const payload = buildPreferencesUpdatePayload(profile, draft);
      onSave(payload);
    } catch (e) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
      if (__DEV__) console.warn('ProfilePreferencesForm submit error:', e);
    }
  }

  function handleLogOut() {
    if (typeof onLogOut === 'function') {
      onLogOut();
      return;
    }
    onClose();
  }

  return (
    <View style={[editProfileStyles.container, { paddingTop: insets.top }]}>
      <View style={editProfileStyles.header}>
        <TouchableOpacity
          style={editProfileStyles.headerBack}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="chevron-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={editProfileStyles.headerTitle}>Preferences</Text>
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
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ModesSection draft={draft} setField={setField} />
        <GenderPreferenceSection draft={draft} setField={setField} />
        <AgeRangeSection draft={draft} setField={setField} />
        <DistanceSection draft={draft} setField={setField} />

        <View style={editProfileStyles.logOutWrap}>
          <TouchableOpacity
            style={editProfileStyles.logOutRow}
            onPress={handleLogOut}
            activeOpacity={0.6}
          >
            <Text style={editProfileStyles.logOutText}>Log out</Text>
          </TouchableOpacity>
        </View>
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
    </View>
  );
}
