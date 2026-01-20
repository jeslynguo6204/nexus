// mobile/features/profile/components/ProfileDetailsForm/ui/FormField.js
import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';

export default function FormField({ label, required = false, children, compact = false, disabled = false }) {
  return (
    <View style={{ marginTop: compact ? 12 : 16 }}>
      {label ? (
        <Text style={{ fontSize: 12, fontWeight: '400', color: disabled ? COLORS.textDisabled : COLORS.textMuted, marginBottom: 10 }}>
          {label}
          {required ? <Text style={{ color: COLORS.danger }}> *</Text> : null}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
