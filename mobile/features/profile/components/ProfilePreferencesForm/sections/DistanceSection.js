import React from 'react';
import { View, Text } from 'react-native';
import {
  EditProfileSectionHeader,
  FormSlider,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';
import { COLORS } from '@/styles/themeNEW';

export default function DistanceSection({ draft, setField }) {
  const miles = draft.maxDistanceMiles ?? 5;

  return (
    <>
      <EditProfileSectionHeader title="Distance" />
      <View style={editProfileStyles.preferencesSliderBlock}>
        <View style={editProfileStyles.preferencesSliderRow}>
          <Text style={editProfileStyles.preferencesSliderLabel}>Show people within</Text>
          <Text style={editProfileStyles.preferencesSliderValue}>
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
      </View>
    </>
  );
}
