// mobile/features/profile/components/ProfilePreferencesForm/sections/DistanceSection.js
import React from 'react';
import { Text, View } from 'react-native';

import { COLORS } from '@/styles/themeNEW';
import { FormSection, FormField, FormSlider } from '@/features/profile/components/form-editor-components';

export default function DistanceSection({ draft, setField }) {
  const miles = draft.maxDistanceMiles ?? 5;

  return (
    <FormSection title="Distance">
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
            Show people within
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.textPrimary }}>
            {miles} {miles === 1 ? 'mile' : 'miles'}
          </Text>
        </View>
        <FormSlider
          value={miles}
          onValueChange={(v) => setField('maxDistanceMiles', Math.round(v))}
          minimumValue={1}
          maximumValue={50}
          step={1}
          showValue={false}
          minimumTrackTintColor={COLORS.textPrimary}
          maximumTrackTintColor={COLORS.divider}
          thumbTintColor={COLORS.textPrimary}
        />
      </FormField>
    </FormSection>
  );
}
