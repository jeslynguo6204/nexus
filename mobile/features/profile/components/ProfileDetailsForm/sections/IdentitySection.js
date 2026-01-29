import React from 'react';
import { View } from 'react-native';
import {
  EditProfileRow,
  RowTextInput,
  ChipRow,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';

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
    <>
      <EditProfileRow label="Name">
        <RowTextInput
          value={draft.displayName}
          onChangeText={(v) => setField('displayName', v)}
          placeholder="Your display name"
        />
      </EditProfileRow>
      <EditProfileRow label="Gender">
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.gender}
          onSelect={(v) => setField('gender', v)}
          wrap={false}
        />
      </EditProfileRow>
      <EditProfileRow label="Pronouns">
        <ChipRow
          options={PRONOUN_OPTIONS}
          selected={draft.pronouns}
          onSelect={(v) => setField('pronouns', v)}
          allowUnselect
          wrap={false}
        />
      </EditProfileRow>
      <EditProfileRow
        label="Sexuality"
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
    </>
  );
}
