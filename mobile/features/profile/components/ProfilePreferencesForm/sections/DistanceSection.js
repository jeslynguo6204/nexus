// mobile/features/profile/components/ProfilePreferencesForm/sections/DistanceSection.js
import React from 'react';

import { FormSection, FormField, FormSlider } from '@/features/profile/components/form-editor-components';

export default function DistanceSection({ draft, setField }) {
  const miles = draft.maxDistanceMiles ?? 5;

  return (
    <FormSection title="Maximum distance">
      <FormField label="Show people within">
        <FormSlider
          title="Show people within"
          value={miles}
          onValueChange={(v) => setField('maxDistanceMiles', Math.round(v))}
          minimumValue={1}
          maximumValue={50}
          step={1}
          formatValue={(v) => `${Math.round(v)} ${Math.round(v) === 1 ? 'mile' : 'miles'}`}
        />
      </FormField>
    </FormSection>
  );
}
