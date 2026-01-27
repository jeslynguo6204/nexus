import React from 'react';
import {
  EditProfileSectionHeader,
  EditProfileToggleRow,
} from '@/features/profile/components/form-editor-components';

export default function ModesSection({ draft, setField }) {
  return (
    <>
      <EditProfileSectionHeader title="Mode" first />
      <EditProfileToggleRow
        label="Dating mode"
        subtitle="See and be seen by people looking to date"
        value={draft.isDatingEnabled}
        onValueChange={(v) => setField('isDatingEnabled', v)}
      />
      <EditProfileToggleRow
        label="Friend mode"
        subtitle="See and be seen by people looking for friends"
        value={draft.isFriendsEnabled}
        onValueChange={(v) => setField('isFriendsEnabled', v)}
      />
    </>
  );
}
