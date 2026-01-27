import React from 'react';
import { TextInput } from 'react-native';
import editProfileStyles from '@/styles/EditProfileStyles';
import { COLORS } from '@/styles/themeNEW';

/**
 * Minimal text input for EditProfileRow (Instagram-style): no box, right-aligned.
 */
export default function RowTextInput({
  value,
  onChangeText,
  onBlur,
  placeholder,
  multiline = false,
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textMuted}
      multiline={multiline}
      style={[
        editProfileStyles.inputInline,
        multiline && { textAlignVertical: 'top', minHeight: 60 },
      ]}
    />
  );
}
