// mobile/features/profile/components/ProfilePreferencesForm/sections/GenderPreferenceSection.js
import React from 'react';

import { FormSection, FormField, ChipRow } from '@/features/profile/components/form-editor-components';

const GENDER_OPTIONS = ['male', 'female', 'non-binary', 'everyone'];

export default function GenderPreferenceSection({ draft, setField }) {
  return (
    <FormSection title="Who you want to see">
      <FormField label="Dating">
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.datingGenderPreference || 'everyone'}
          onSelect={(v) => setField('datingGenderPreference', v)}
        />
      </FormField>

      <FormField label="Friends">
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.friendsGenderPreference || 'everyone'}
          onSelect={(v) => setField('friendsGenderPreference', v)}
        />
      </FormField>
    </FormSection>
  );
}
