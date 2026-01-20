// mobile/features/profile/components/ProfilePreferencesForm/sections/AgeRangeSection.js
import React from 'react';
import { View, Text } from 'react-native';

import { COLORS } from '@/styles/themeNEW';
import { FormSection, FormField, RangeSlider } from '@/features/profile/components/form-editor-components';

export default function AgeRangeSection({ draft, setField }) {
  const minAge = draft.minAgePreference ?? 18;
  const maxAge = draft.maxAgePreference ?? 24;

  return (
    <FormSection title="Age Range">
      <FormField label="">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.textMuted }}>
            Preferred Age
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.textPrimary }}>
            {minAge} – {maxAge}
          </Text>
        </View>

        <RangeSlider
          minValue={minAge}
          maxValue={maxAge}
          onMinChange={(v) => setField('minAgePreference', v)}
          onMaxChange={(v) => setField('maxAgePreference', v)}
          minimumValue={18}
          maximumValue={40}
          step={1}
          showLabels={false}
        />
      </FormField>
    </FormSection>
  );
}
