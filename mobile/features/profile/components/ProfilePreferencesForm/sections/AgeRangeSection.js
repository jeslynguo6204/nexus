// mobile/features/profile/components/ProfilePreferencesForm/sections/AgeRangeSection.js
import React from 'react';
import { View, Text } from 'react-native';

import { COLORS } from '@/styles/themeNEW';
import { FormSection, FormField, FormSlider } from '@/features/profile/components/form-editor-components';

export default function AgeRangeSection({ draft, setField }) {
  const minAge = draft.minAgePreference ?? 18;
  const maxAge = draft.maxAgePreference ?? 24;

  function handleMinAgeChange(v) {
    const newMin = Math.round(v);
    setField('minAgePreference', newMin);
    if (newMin > maxAge) setField('maxAgePreference', newMin);
  }

  function handleMaxAgeChange(v) {
    const newMax = Math.round(v);
    setField('maxAgePreference', newMax);
    if (newMax < minAge) setField('minAgePreference', newMax);
  }

  return (
    <FormSection title="Age range">
      <FormField label="Preferred ages">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.textPrimary }}>
            Preferred ages
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.textPrimary }}>
            {minAge} – {maxAge}
          </Text>
        </View>

        <Text style={{ fontSize: 12, fontWeight: '400', color: COLORS.textMuted, marginBottom: 10 }}>
          Minimum age
        </Text>
        <FormSlider
          value={minAge}
          onValueChange={handleMinAgeChange}
          minimumValue={18}
          maximumValue={40}
          step={1}
          showValue={false}
        />

        <Text style={{ fontSize: 12, fontWeight: '400', color: COLORS.textMuted, marginTop: 16, marginBottom: 10 }}>
          Maximum age
        </Text>
        <FormSlider
          value={maxAge}
          onValueChange={handleMaxAgeChange}
          minimumValue={18}
          maximumValue={40}
          step={1}
          showValue={false}
        />
      </FormField>
    </FormSection>
  );
}
