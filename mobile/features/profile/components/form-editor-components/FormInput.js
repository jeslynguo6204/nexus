// mobile/features/profile/components/ProfileDetailsForm/ui/FormInput.js
import React from 'react';
import { TextInput } from 'react-native';
import { COLORS } from '@/styles/themeNEW';

export default function FormInput({
  value,
  onChangeText,
  onBlur,
  placeholder,
  multiline = false,
  style,
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
        {
          backgroundColor: COLORS.backgroundSubtle,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 14 : 14,
          fontSize: 16,
          color: COLORS.textPrimary,
          fontWeight: '400',
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        },
        style,
      ]}
    />
  );
}
