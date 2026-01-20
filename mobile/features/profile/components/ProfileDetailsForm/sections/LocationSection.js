// mobile/features/profile/components/ProfileDetailsForm/sections/LocationSection.js
import React from 'react';
import {
  FormSection,
  FormField,
  FormInput,
} from '@/features/profile/components/form-editor-components';

export default function LocationSection({ draft, setField }) {
  return (
    <FormSection title="Location & Background">
      <FormField label="Location">
        <FormInput
          value={draft.locationDescription}
          onChangeText={(v) => setField('locationDescription', v)}
          placeholder="Where are you currently located?"
        />
      </FormField>

      <FormField label="Hometown">
        <FormInput
          value={draft.hometown}
          onChangeText={(v) => setField('hometown', v)}
          placeholder="Where do you call home?"
        />
      </FormField>

      <FormField label="Languages">
        <FormInput
          value={draft.languages}
          onChangeText={(v) => setField('languages', v)}
          placeholder="e.g. English, Spanish, French"
        />
      </FormField>

      {/* Optional: coordinates if you still use these */}
      <FormField label="Location latitude" compact>
        <FormInput
          value={draft.locationLat}
          onChangeText={(v) => setField('locationLat', v)}
          placeholder="Optional"
        />
      </FormField>

      <FormField label="Location longitude" compact>
        <FormInput
          value={draft.locationLon}
          onChangeText={(v) => setField('locationLon', v)}
          placeholder="Optional"
        />
      </FormField>
    </FormSection>
  );
}
