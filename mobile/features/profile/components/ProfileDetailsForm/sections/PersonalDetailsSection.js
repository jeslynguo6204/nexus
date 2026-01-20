// mobile/features/profile/components/ProfileDetailsForm/sections/PersonalDetailsSection.js
import React from 'react';
import FormSection from '../ui/FormSection';
import FormField from '../ui/FormField';
import FormInput from '../ui/FormInput';
import FormSelectRow from '../ui/FormSelectRow';

const RELIGIOUS_OPTIONS = [
  'Christian', 'Catholic', 'Jewish', 'Muslim', 'Hindu', 'Buddhist',
  'Agnostic', 'Atheist', 'Spiritual', 'Other', 'Prefer not to say',
];

const POLITICAL_OPTIONS = [
  'Very Liberal', 'Liberal', 'Moderate', 'Conservative', 'Very Conservative',
  'Libertarian', 'Other', 'Prefer not to say',
];

const ETHNICITY_OPTIONS = [
  'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino',
  'Middle Eastern or North African', 'Native Hawaiian or Other Pacific Islander', 'White',
  'Other', 'Prefer not to say',
];

export default function PersonalDetailsSection({ draft, setField, openSelectionSheet }) {
  return (
    <FormSection title="Personal Details">
      <FormField label="Height">
        <FormInput
          value={draft.height}
          onChangeText={(v) => setField('height', v)}
          placeholder="e.g. 5'8 or 173 cm"
        />
      </FormField>

      <FormField label="Religious Beliefs">
        <FormSelectRow
          value={draft.religiousBeliefs}
          placeholder="Not selected"
          onPress={() =>
            openSelectionSheet({
              title: 'Religious beliefs',
              options: RELIGIOUS_OPTIONS.map((x) => ({ id: x, name: x })),
              selected: draft.religiousBeliefs || [],
              allowMultiple: true,
              allowUnselect: true,
              onSelect: (value) => setField('religiousBeliefs', Array.isArray(value) ? value : (value ? [value] : [])),
            })
          }
        />
      </FormField>

      <FormField label="Political Affiliation">
        <FormSelectRow
          value={draft.politicalAffiliation}
          placeholder="Not selected"
          onPress={() =>
            openSelectionSheet({
              title: 'Political affiliation',
              options: POLITICAL_OPTIONS.map((x) => ({ id: x, name: x })),
              selected: draft.politicalAffiliation || null,
              allowMultiple: false,
              allowUnselect: true,
              onSelect: (value) => setField('politicalAffiliation', value || ''),
            })
          }
        />
      </FormField>

      <FormField label="Ethnicity">
        <FormSelectRow
          value={draft.ethnicity}
          placeholder="Not selected"
          onPress={() =>
            openSelectionSheet({
              title: 'Ethnicity',
              options: ETHNICITY_OPTIONS.map((x) => ({ id: x, name: x })),
              selected: draft.ethnicity || [],
              allowMultiple: true,
              allowUnselect: true,
              onSelect: (value) => setField('ethnicity', Array.isArray(value) ? value : (value ? [value] : [])),
            })
          }
        />
      </FormField>
    </FormSection>
  );
}
