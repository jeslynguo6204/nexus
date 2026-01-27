import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '@/styles/themeNEW';
import {
  EditProfileRow,
} from '@/features/profile/components/form-editor-components';

export default function DormSection({ draft, setField, dorms, loading, openSelectionSheet }) {
  const selectedDormName =
    dorms && draft.dormId
      ? (dorms.find((d) => Number(d.id) === Number(draft.dormId))?.name || '')
      : '';

  if (loading) {
    return (
      <EditProfileRow label="Residential house">
        <ActivityIndicator size="small" color={COLORS.textMuted} />
      </EditProfileRow>
    );
  }
  if (!dorms || dorms.length === 0) return null;

  return (
    <EditProfileRow
      label="Residential house"
      value={selectedDormName}
      placeholder="Not selected"
      onPress={() =>
        openSelectionSheet({
          title: 'Residential house',
          options: dorms,
          selected: draft.dormId || null,
          allowMultiple: false,
          allowUnselect: true,
          onSelect: (value) => setField('dormId', value || null),
        })
      }
    />
  );
}
