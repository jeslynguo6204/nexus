import React from 'react';
import { View } from 'react-native';
import {
  EditProfileSectionHeader,
  EditProfileRow,
  ChipRow,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';

const GENDER_OPTIONS = [
  { label: 'Men', value: 'male' },
  { label: 'Women', value: 'female' },
  { label: 'Non-Binary', value: 'non-binary' },
];

export default function GenderPreferenceSection({ draft, setField }) {
  return (
    <>
      <EditProfileSectionHeader title="Who you want to see" />
      <EditProfileRow label="Dating">
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.datingGenderPreference}
          onSelect={(v) => draft.isDatingEnabled && setField('datingGenderPreference', v)}
          disabled={!draft.isDatingEnabled}
          wrap={false}
          multiSelect
        />
      </EditProfileRow>
      <EditProfileRow label="Friends">
        <ChipRow
          options={GENDER_OPTIONS}
          selected={draft.friendsGenderPreference}
          onSelect={(v) => draft.isFriendsEnabled && setField('friendsGenderPreference', v)}
          disabled={!draft.isFriendsEnabled}
          wrap={false}
          multiSelect
        />
      </EditProfileRow>
    </>
  );
}
