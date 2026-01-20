// mobile/features/profile/components/ProfileDetailsForm/ui/FormSection.js
import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';

export default function FormSection({ title, children, first = false }) {
  return (
    <View style={{ marginTop: first ? 24 : 36 }}>
      <Text style={{ fontSize: 16, fontWeight: '500', color: COLORS.textPrimary, letterSpacing: -0.2 }}>
        {title}
      </Text>
      <View style={{ marginTop: 4 }}>{children}</View>
    </View>
  );
}
