// mobile/features/profile/components/ProfileDetailsForm/sections/AcademicsSection.js
import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';
import FormSection from '../ui/FormSection';
import FormField from '../ui/FormField';
import FormInput from '../ui/FormInput';
import ChipRow from '../ui/ChipRow';

const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export default function AcademicsSection({ draft, setField, schoolLabel }) {
  return (
    <FormSection title="Academics">
      <FormField label="School" required>
        <View
          style={{
            backgroundColor: COLORS.backgroundSubtle,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '400', color: COLORS.textPrimary }}>
            {schoolLabel}
          </Text>
        </View>
      </FormField>

      <FormField label="Academic year" required>
        <ChipRow
          options={ACADEMIC_YEARS}
          selected={draft.academicYear || ''}
          onSelect={(v) => setField('academicYear', v)}
        />
      </FormField>

      <FormField label="Graduation year">
        <ChipRow
          options={GRAD_YEARS.map(String)}
          selected={draft.graduationYear || ''}
          onSelect={(v) => setField('graduationYear', v)}
          allowUnselect
        />
      </FormField>

      <FormField label="Major/Area of Study">
        <FormInput
          value={draft.major}
          onChangeText={(v) => setField('major', v)}
          placeholder="e.g. Computer Science"
        />
      </FormField>
    </FormSection>
  );
}
