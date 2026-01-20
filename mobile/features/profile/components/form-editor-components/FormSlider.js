// mobile/features/profile/components/form-editor-components/FormSlider.js

import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '@/styles/themeNEW';

/**
 * FormSlider
 *
 * Designed to be used inside <FormField label="..."> ... </FormField>
 *
 * Props:
 * - title: string (optional) -> left text in the header row
 * - value: number (required)
 * - onValueChange: (number) => void (required)
 * - minimumValue, maximumValue: number (required)
 * - step: number (optional)
 * - formatValue: (number) => string (optional) -> controls right-side value text
 * - valueText: string (optional) -> if provided, overrides formatValue
 * - showValue: boolean (optional, default true)
 * - minimumTrackTintColor / maximumTrackTintColor / thumbTintColor: optional overrides
 * - disabled: boolean (optional)
 * - onSlidingComplete: (number) => void (optional)
 * - cardStyle: style override for the card container
 */
export default function FormSlider({
  title,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  formatValue,
  valueText,
  showValue = true,
  disabled = false,
  onSlidingComplete,
  minimumTrackTintColor = COLORS.accent,
  maximumTrackTintColor = COLORS.accentSoft,
  thumbTintColor = COLORS.accent,
  cardStyle,
}) {
  const computedValueText = useMemo(() => {
    if (!showValue) return '';
    if (typeof valueText === 'string') return valueText;
    if (typeof formatValue === 'function') return formatValue(value);
    return String(value);
  }, [showValue, valueText, formatValue, value]);

  return (
    <View>
      {(title || (showValue && computedValueText)) ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              color: COLORS.textPrimary,
              flex: 1,
              paddingRight: 12,
            }}
            numberOfLines={1}
          >
            {title || ''}
          </Text>

          {showValue ? (
            <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.textPrimary }}>
              {computedValueText}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          {
            backgroundColor: COLORS.backgroundSubtle,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            opacity: disabled ? 0.6 : 1,
          },
          cardStyle,
        ]}
      >
        <Slider
          value={value}
          onValueChange={onValueChange}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          disabled={disabled}
          onSlidingComplete={onSlidingComplete}
          minimumTrackTintColor={minimumTrackTintColor}
          maximumTrackTintColor={maximumTrackTintColor}
          thumbTintColor={thumbTintColor}
        />
      </View>
    </View>
  );
}
