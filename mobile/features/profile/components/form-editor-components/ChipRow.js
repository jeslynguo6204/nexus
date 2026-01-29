// ChipRow.js
import React from 'react';
import { ScrollView, View, TouchableOpacity, Text } from 'react-native';

const defaultStyles = {
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderColor: 'rgba(0,0,0,0.20)',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.72)',
  },
  chipTextSelected: {
    color: 'rgba(0,0,0,0.92)',
  },

  chipDisabled: {
    opacity: 0.5,
  },
};

export default function ChipRow({
  options = [],
  selected,
  onSelect,
  allowUnselect = false,
  disabled = false,

  // NEW:
  // - wrap: true => multi-line chips (recommended for auth)
  // - wrap: false => horizontal scroll (like your old behavior)
  wrap = true,

  // NEW: pass AuthStyles.v3 (or any style object with chip keys)
  stylesOverride,
}) {
  const s = stylesOverride || defaultStyles;

  const content = (
    <View style={s.chipWrap}>
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isSelected = selected === value;

        return (
          <TouchableOpacity
            key={value}
            activeOpacity={0.9}
            disabled={disabled}
            onPress={() => {
              if (disabled) return;
              if (allowUnselect && isSelected) onSelect?.('');
              else onSelect?.(value);
            }}
            style={[
              s.chip,
              isSelected && s.chipSelected,
              disabled && s.chipDisabled,
            ]}
          >
            <Text style={[s.chipText, isSelected && s.chipTextSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (wrap) return content;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 20 }}
      scrollEnabled={!disabled}
    >
      {content}
    </ScrollView>
  );
}
