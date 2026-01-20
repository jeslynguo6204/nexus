// mobile/features/profile/components/ProfileDetailsForm/ui/FormSelectRow.js
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '@/styles/themeNEW';

export default function FormSelectRow({ value, placeholder = 'Not selected', onPress }) {
  const showPlaceholder = !value || (Array.isArray(value) && value.length === 0);
  const text = Array.isArray(value) ? value.join(', ') : value;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.backgroundSubtle,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <Text
        numberOfLines={2}
        style={{
          fontSize: 16,
          color: showPlaceholder ? COLORS.textMuted : COLORS.textPrimary,
          fontWeight: '400',
          flex: 1,
          paddingRight: 10,
        }}
      >
        {showPlaceholder ? placeholder : text}
      </Text>

      <View style={{ marginLeft: 8 }}>
        <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
