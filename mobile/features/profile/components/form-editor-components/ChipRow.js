// ChipRow.js
import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';

export default function ChipRow({
  options,
  selected,
  onSelect,
  allowUnselect = false,
  disabled = false,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 20 }}
      scrollEnabled={!disabled}
    >
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;

        const isSelected = selected === value;

        return (
          <TouchableOpacity
            key={value}
            onPress={() => {
              if (disabled) return;
              if (allowUnselect && isSelected) onSelect('');
              else onSelect(value);
            }}
            disabled={disabled}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: disabled
                ? '#EEEEEE'
                : isSelected
                ? COLORS.textPrimary
                : COLORS.backgroundSubtle,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '400',
                color:
                  disabled && !isSelected
                    ? COLORS.textDisabled
                    : isSelected
                    ? COLORS.surface
                    : COLORS.textPrimary,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
