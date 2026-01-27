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
        <View style={editProfileStyles.chipsWrap}>
          <ChipRow
            options={ACADEMIC_YEARS}
            selected={draft.academicYear || ''}
            onSelect={(v) => setField('academicYear', v)}
          />
        </View>
      </EditProfileRow>
      <EditProfileRow label="Graduation year">
        <View style={editProfileStyles.chipsWrap}>
          <ChipRow
            options={GRAD_YEARS.map(String)}
            selected={draft.graduationYear || ''}
            onSelect={(v) => setField('graduationYear', v)}
            allowUnselect
          />
        </View>
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
