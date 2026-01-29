// ChipRow.js
import React from 'react';
import { ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/styles/themeNEW';

const defaultStyles = {
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: COLORS.backgroundSubtle, // #F4F4F5 - matches key affiliations unselected
  },
  chipSelected: {
    backgroundColor: COLORS.textPrimary, // #111111 - matches key affiliations selected
  },
  chipText: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textPrimary, // #111111 - matches key affiliations unselected text
  },
  chipTextSelected: {
    color: COLORS.surface, // #FFFFFF - matches key affiliations selected text
    fontWeight: '400',
  },

  chipDisabled: {
    opacity: 0.4,
  },
};

export default function ChipRow({
  options = [],
  selected,
  onSelect,
  allowUnselect = false,
  disabled = false,
  // When true, selected is an array and toggling adds/removes; at least one must remain unless allowUnselect
  multiSelect = false,

  // NEW:
  // - wrap: true => multi-line chips (recommended for auth)
  // - wrap: false => horizontal scroll (like your old behavior)
  wrap = true,

  // NEW: pass AuthStyles.v3 (or any style object with chip keys)
  stylesOverride,
}) {
  const s = stylesOverride || defaultStyles;
  const selectedArr = Array.isArray(selected) ? selected : (selected != null ? [selected] : []);

  const content = (
    <View style={wrap ? s.chipWrap : { flexDirection: 'row' }}>
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isSelected = multiSelect ? selectedArr.includes(value) : selected === value;

        return (
          <TouchableOpacity
            key={value}
            activeOpacity={0.9}
            disabled={disabled}
            onPress={() => {
              if (disabled) return;
              if (multiSelect) {
                const next = isSelected
                  ? selectedArr.filter((v) => v !== value)
                  : [...selectedArr, value];
                if (next.length === 0 && !allowUnselect) return;
                onSelect?.(next);
              } else {
                if (allowUnselect && isSelected) onSelect?.('');
                else onSelect?.(value);
              }
            }}
            style={[
              s.chip,
              isSelected && s.chipSelected,
              disabled && s.chipDisabled,
              !wrap && { marginBottom: 0 }, // Remove bottom margin when scrolling horizontally
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
      contentContainerStyle={{ paddingRight: 20, flexDirection: 'row', alignItems: 'center' }}
      scrollEnabled={!disabled}
      style={{ flex: 1 }}
    >
      {content}
    </ScrollView>
  );
}
