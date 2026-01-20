// mobile/features/profile/components/ProfileDetailsForm/ui/ChipRow.js
import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';

export default function ChipRow({ options, selected, onSelect, allowUnselect = false }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
      {options.map((opt) => {
        const isSelected = selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => {
              if (allowUnselect && isSelected) onSelect('');
              else onSelect(opt);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: isSelected ? COLORS.textPrimary : COLORS.backgroundSubtle,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '400', color: isSelected ? COLORS.surface : COLORS.textPrimary }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
