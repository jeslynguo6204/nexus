import React from 'react';
import { View, Text } from 'react-native';
import {
  EditProfileSectionHeader,
  RangeSlider,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';
import { COLORS } from '@/styles/themeNEW';

export default function AgeRangeSection({ draft, setField }) {
  const minAge = draft.minAgePreference ?? 18;
  const maxAge = draft.maxAgePreference ?? 24;

  return (
    <>
      <EditProfileSectionHeader title="Age range" />
      <View style={editProfileStyles.preferencesSliderBlock}>
        <View style={editProfileStyles.preferencesSliderRow}>
          <Text style={editProfileStyles.preferencesSliderLabel}>Preferred age</Text>
          <Text style={editProfileStyles.preferencesSliderValue}>
            {minAge} – {maxAge}
          </Text>
        </View>
        <View style={{ backgroundColor: COLORS.backgroundSubtle, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 }}>
          <RangeSlider
            minValue={minAge}
            maxValue={maxAge}
            onMinChange={(v) => setField('minAgePreference', v)}
            onMaxChange={(v) => setField('maxAgePreference', v)}
            minimumValue={18}
            maximumValue={40}
            step={1}
            showLabels={false}
            minimumTrackTintColor={COLORS.textPrimary}
            maximumTrackTintColor={COLORS.divider}
            thumbTintColor={COLORS.textPrimary}
          />
        </View>
      </View>
    </>
  );
}
