// mobile/features/profile/components/ProfilePreferencesForm/ProfilePreferencesForm.js
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import { COLORS } from '@/styles/themeNEW';
import SelectionSheet from '@/features/profile/components/SelectionSheet';

import ModesSection from './sections/ModesSection';
import GenderPreferenceSection from './sections/GenderPreferenceSection';
import AgeRangeSection from './sections/AgeRangeSection';
import DistanceSection from './sections/DistanceSection';

import { preferencesFromProfile } from './utils/preferencesDraft';
import { buildPreferencesUpdatePayload } from './utils/preferencesPayload';

export default function ProfilePreferencesForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();

  const [draft, setDraft] = useState(() => preferencesFromProfile(profile));
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  // Optional: keep draft in sync if profile changes while mounted
  useEffect(() => {
    setDraft(preferencesFromProfile(profile));
  }, [profile]);

  // Selection sheet state (optional – only needed if you later switch some rows to use sheet)
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetConfig, setSheetConfig] = useState(null);

  const openSelectionSheet = (config) => {
    setSheetConfig(config);
    setSheetVisible(true);
  };

  const closeSelectionSheet = () => {
    setSheetVisible(false);
    setSheetConfig(null);
  };

  const headerRightDisabled = useMemo(() => false, []);

  function submit() {
    const payload = buildPreferencesUpdatePayload(profile, draft);
    onSave(payload);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface, paddingTop: insets.top }}>
      {/* Header (match ProfileDetailsForm) */}
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
          disabled={headerRightDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ paddingHorizontal: 4, paddingVertical: 4, opacity: headerRightDisabled ? 0.5 : 1 }}
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
        <ModesSection draft={draft} setField={setField} />

        <GenderPreferenceSection draft={draft} setField={setField} />

        <AgeRangeSection draft={draft} setField={setField} />

        <DistanceSection draft={draft} setField={setField} />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Optional SelectionSheet (kept to mirror ProfileDetailsForm pattern) */}
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
