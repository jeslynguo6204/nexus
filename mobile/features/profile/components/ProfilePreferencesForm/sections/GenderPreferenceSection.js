import React from 'react';
import { View } from 'react-native';
import {
  EditProfileSectionHeader,
  EditProfileRow,
  ChipRow,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-Binary', value: 'non-binary' },
  { label: 'Everyone', value: 'everyone' },
];

export default function GenderPreferenceSection({ draft, setField }) {
  return (
    <>
      <EditProfileSectionHeader title="Who you want to see" />
      <EditProfileRow label="Dating">
        <View style={[editProfileStyles.chipsWrap, !draft.isDatingEnabled && { opacity: 0.5 }]}>
          <ChipRow
            options={GENDER_OPTIONS}
            selected={draft.datingGenderPreference}
            onSelect={(v) => draft.isDatingEnabled && setField('datingGenderPreference', v)}
            disabled={!draft.isDatingEnabled}
          />
        </View>
      </EditProfileRow>
      <EditProfileRow label="Friends">
        <View style={[editProfileStyles.chipsWrap, !draft.isFriendsEnabled && { opacity: 0.5 }]}>
          <ChipRow
            options={GENDER_OPTIONS}
            selected={draft.friendsGenderPreference}
            onSelect={(v) => draft.isFriendsEnabled && setField('friendsGenderPreference', v)}
            disabled={!draft.isFriendsEnabled}
          />
        </View>
      </EditProfileRow>
    </>
  );
}
