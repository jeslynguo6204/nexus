import React from 'react';
import {
  EditProfileRow,
  RowTextInput,
} from '@/features/profile/components/form-editor-components';

export default function LocationSection({ draft, setField }) {
  return (
    <>
      <EditProfileRow label="Location">
        <RowTextInput
          value={draft.locationDescription}
          onChangeText={(v) => setField('locationDescription', v)}
          placeholder="Where are you currently located?"
        />
      </EditProfileRow>
      <EditProfileRow label="Hometown">
        <RowTextInput
          value={draft.hometown}
          onChangeText={(v) => setField('hometown', v)}
          placeholder="Where do you call home?"
        />
      </EditProfileRow>
      <EditProfileRow label="Languages">
        <RowTextInput
          value={draft.languages}
          onChangeText={(v) => setField('languages', v)}
          placeholder="e.g. English, Spanish, French"
        />
      </EditProfileRow>
    </>
  );
}
