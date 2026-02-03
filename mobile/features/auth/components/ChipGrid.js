import React from 'react';
import { View } from 'react-native';
import EditorialChip from './EditorialChip';

export default function ChipGrid({
  options,
  value,
  onChange,
  columns = 2,
  disabled = false,
}) {
  const GAP = 10;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GAP / 2 }}>
      {options.map((opt) => (
        <View
          key={opt}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: GAP / 2,
            marginBottom: GAP,
          }}
        >
          <EditorialChip
            label={opt}
            selected={value === opt}
            disabled={disabled}
            onPress={() => onChange(opt)}
          />
        </View>
      ))}
    </View>
  );
}
