import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

export default function PrimaryCTA({
  label,
  onPress,
  disabled = false,
  showChevron = true,
  buttonStyle,
  textStyle,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled}
      style={[
        {
          position: 'relative',
          minHeight: 54,
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
        },
        buttonStyle,
      ]}
    >
      <Text style={textStyle}>{label}</Text>

      {showChevron && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 18,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
          }}
        >
          <FontAwesome6 name="chevron-right" size={14} color="rgba(31,98,153,0.8)" />
        </View>
      )}
    </TouchableOpacity>
  );
}
