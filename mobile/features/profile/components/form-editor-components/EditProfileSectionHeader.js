import React from 'react';
import { Text } from 'react-native';
import editProfileStyles from '@/styles/EditProfileStyles';

export default function EditProfileSectionHeader({ title, first = false }) {
  return (
    <Text
      style={[
        editProfileStyles.sectionHeader,
        first && editProfileStyles.sectionHeaderFirst,
      ]}
    >
      {title}
    </Text>
  );
}
