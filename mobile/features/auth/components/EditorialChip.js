import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function EditorialChip({
  label,
  selected,
  onPress,
  disabled = false,
  style,
}) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.9}
      disabled={disabled}
      style={[
        {
          minHeight: 44,
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected
            ? 'rgba(255,255,255,0.92)'
            : 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: selected
            ? 'rgba(255,255,255,0.0)'
            : 'rgba(255,255,255,0.14)',
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 14,
          letterSpacing: -0.1,
          fontWeight: selected ? '700' : '600',
          color: selected ? '#0F3B61' : 'rgba(255,255,255,0.92)',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
