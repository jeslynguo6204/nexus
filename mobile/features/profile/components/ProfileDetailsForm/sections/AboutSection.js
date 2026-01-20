// mobile/features/profile/components/ProfileDetailsForm/sections/AboutSection.js
import React from 'react';
import {
  FormSection,
  FormField,
  FormInput,
  ChipRow,
} from '@/features/profile/components/form-editor-components';

export default function AboutSection({ draft, setField }) {
  return (
    <FormSection title="About Me" first>
      <FormField label="Bio">
        <FormInput
          value={draft.bio}
          onChangeText={(v) => setField('bio', v)}
          placeholder="Say something about yourself"
          multiline
        />
      </FormField>

      {/* Keep prompts in draft only if you actually use it later; otherwise remove from draft + section
      <FormField label="Prompts">
        <FormInput
          value={draft.prompts || ''}
          onChangeText={(v) => setField('prompts', v)}
          placeholder="Answer prompts to help others get to know you"
          multiline
        />
      </FormField> */}
    </FormSection>
  );
}
