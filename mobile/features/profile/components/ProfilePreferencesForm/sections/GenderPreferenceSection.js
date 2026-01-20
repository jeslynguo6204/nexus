// mobile/features/profile/components/ProfilePreferencesForm/sections/GenderPreferenceSection.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { COLORS } from '@/styles/themeNEW';
import { FormSection, FormField, ChipRow } from '@/features/profile/components/form-editor-components';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
  { label: 'Everyone', value: 'everyone' },
];

export default function GenderPreferenceSection({ draft, setField }) {
  return (
    <FormSection title="Who You Want To See">
      <FormField label="Dating" disabled={!draft.isDatingEnabled}>
        <ChipRow
        options={GENDER_OPTIONS}
        selected={draft.datingGenderPreference || 'everyone'}
        onSelect={(v) => draft.isDatingEnabled && setField('datingGenderPreference', v)}
        disabled={!draft.isDatingEnabled}
        />
      </FormField>

      <FormField label="Friends" disabled={!draft.isFriendsEnabled}>
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.friendsGenderPreference || 'everyone'}
          onSelect={(v) => draft.isFriendsEnabled && setField('friendsGenderPreference', v)}
          disabled={!draft.isFriendsEnabled}
        />
      </FormField>
    </FormSection>
  );
}
