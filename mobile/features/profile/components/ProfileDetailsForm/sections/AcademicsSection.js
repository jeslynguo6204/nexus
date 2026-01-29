import React from 'react';
import { View, Text } from 'react-native';
import {
  EditProfileRow,
  RowTextInput,
  ChipRow,
} from '@/features/profile/components/form-editor-components';
import editProfileStyles from '@/styles/EditProfileStyles';

const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export default function AcademicsSection({ draft, setField, schoolLabel }) {
  return (
    <>
      <EditProfileRow label="School">
        <Text style={editProfileStyles.rowValue}>{schoolLabel}</Text>
      </EditProfileRow>
      <EditProfileRow label="Academic year">
        <ChipRow
          options={ACADEMIC_YEARS}
          selected={draft.academicYear || ''}
          onSelect={(v) => setField('academicYear', v)}
          wrap={false}
        />
      </EditProfileRow>
      <EditProfileRow label="Graduation year">
        <ChipRow
          options={GRAD_YEARS.map(String)}
          selected={draft.graduationYear || ''}
          onSelect={(v) => setField('graduationYear', v)}
          allowUnselect
          wrap={false}
        />
      </EditProfileRow>
      <EditProfileRow label="Major">
        <RowTextInput
          value={draft.major}
          onChangeText={(v) => setField('major', v)}
          placeholder="e.g. Computer Science"
        />
      </EditProfileRow>
    </>
  );
}
