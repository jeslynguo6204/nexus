// mobile/features/auth/components/SlotInput.js
import React from 'react';
import { View, TextInput } from 'react-native';

export default function SlotInput({
  value,
  onChangeText,
  placeholder,
  onFocus,
  onBlur,
  inputStyle,
  placeholderTextColor = 'rgba(255,255,255,0.5)',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  returnKeyType = 'done',
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <TextInput
        value={value}
        onChangeText={(v) => {
          // preserve casing exactly as typed
          onChangeText?.(v);
        }}
        onBlur={() => {
          // trim only when leaving the field
          onChangeText?.((value ?? '').trim());
          onBlur?.();
        }}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        style={inputStyle}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
      />
    </View>
  );
}
