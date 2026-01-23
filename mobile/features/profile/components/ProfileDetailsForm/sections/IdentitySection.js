// mobile/features/profile/components/ProfileDetailsForm/sections/IdentitySection.js
import React from 'react';
import {
  FormSection,
  FormField,
  FormInput,
  FormSelectRow,
  ChipRow,
} from '@/features/profile/components/form-editor-components';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-Binary', value: 'non-binary' },
];
const PRONOUN_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Other'];
const SEXUALITY_OPTIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Prefer not to say',
];

export default function IdentitySection({ draft, setField, openSelectionSheet }) {
  return (
    <FormSection title="Identity">
      <FormField label="Name" required>
        <FormInput
          value={draft.displayName}
          onChangeText={(v) => setField('displayName', v)}
          placeholder="Your display name"
        />
      </FormField>

      <FormField label="Gender" required>
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.gender}
          onSelect={(v) => setField('gender', v)}
        />
      </FormField>

      <FormField label="Pronouns">
        <ChipRow
          options={PRONOUN_OPTIONS}
          selected={draft.pronouns}
          onSelect={(v) => setField('pronouns', v)}
          allowUnselect
        />
      </FormField>

      <FormField label="Sexuality">
        <FormSelectRow
          value={draft.sexuality}
          placeholder="Not selected"
          onPress={() =>
            openSelectionSheet({
              title: 'Sexuality',
              options: SEXUALITY_OPTIONS.map((x) => ({ id: x, name: x })),
              selected: draft.sexuality || null,
              allowMultiple: false,
              allowUnselect: true,
              onSelect: (value) => setField('sexuality', value || ''),
            })
          }
        />
      </FormField>
    </FormSection>
  );
}
