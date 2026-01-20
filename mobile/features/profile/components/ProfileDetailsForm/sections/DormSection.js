// mobile/features/profile/components/ProfileDetailsForm/sections/DormSection.js
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { COLORS } from '@/styles/themeNEW';
import {
  FormSection,
  FormField,
  FormSelectRow,
} from '@/features/profile/components/form-editor-components';

export default function DormSection({ draft, setField, dorms, loading, openSelectionSheet }) {
  if (!dorms || dorms.length === 0) return null;

  const selectedDormName =
    draft.dormId
      ? (dorms.find((d) => Number(d.id) === Number(draft.dormId))?.name || '')
      : '';

  return (
    <FormSection title="Dorm">
      <FormField label="Residential House">
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.textMuted} />
        ) : (
          <FormSelectRow
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
        )}
      </FormField>
    </FormSection>
  );
}
