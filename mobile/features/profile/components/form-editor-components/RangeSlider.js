// mobile/features/profile/components/form-editor-components/RangeSlider.js

import React, { useState, useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS } from '@/styles/themeNEW';

/**
 * RangeSlider
 *
 * A custom component that allows selecting a range by dragging both ends.
 * 
 * Props:
 * - minValue: number (required) -> current minimum value
 * - maxValue: number (required) -> current maximum value
 * - onMinChange: (number) => void (required)
 * - onMaxChange: (number) => void (required)
 * - minimumValue: number (required) -> lower bound
 * - maximumValue: number (required) -> upper bound
 * - step: number (optional, default 1)
 * - showLabels: boolean (optional, default true)
 */
export default function RangeSlider({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minimumValue,
  maximumValue,
  step = 1,
  showLabels = true,
  minimumTrackTintColor = COLORS.textPrimary,
  maximumTrackTintColor = COLORS.divider,
  thumbTintColor = '#555555',
  cardStyle,
}) {
  const sliderWidth = useRef(0);
  const [aPixels, setAPixels] = useState(0); // min thumb position
  const [bPixels, setBPixels] = useState(0); // max thumb position

  // Convert value to pixel position
  const valueToPixels = (value) => {
    const range = maximumValue - minimumValue;
    const percent = (value - minimumValue) / range;
    return percent * sliderWidth.current;
  };

  // Convert pixel position to value
  const pixelsToValue = (pixels) => {
    const range = maximumValue - minimumValue;
    const percent = Math.max(0, Math.min(1, pixels / sliderWidth.current));
    const rawValue = minimumValue + percent * range;
    // Round to nearest step
    return Math.round(rawValue / step) * step;
  };

  // Sync local pixel positions when props change and not actively dragging
  useEffect(() => {
    if (sliderWidth.current > 0) {
      setAPixels(valueToPixels(minValue));
      setBPixels(valueToPixels(maxValue));
    }
  }, [minValue, maxValue]);

  // Note: Drag behavior handled by native Slider components below for stability.

  const trackLeft = Math.min(aPixels, bPixels);
  const trackWidth = Math.abs(aPixels - bPixels);

  return (
    <View>
      {/* Slider container */}
      <View
        onLayout={(e) => {
          sliderWidth.current = e.nativeEvent.layout.width;
          setAPixels(valueToPixels(minValue));
          setBPixels(valueToPixels(maxValue));
        }}
        style={{ position: 'relative' }}
      >
        {/* Background + Active Track Overlay */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 12,
            height: 4,
            borderRadius: 2,
            backgroundColor: maximumTrackTintColor,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: trackLeft,
            top: 12,
            width: trackWidth,
            height: 4,
            borderRadius: 2,
            backgroundColor: minimumTrackTintColor,
          }}
        />

        {/* Min slider (thumb only) */}
        <Slider
          value={minValue}
          onValueChange={(v) => {
            const newMin = Math.round(v / step) * step;
            // Normalize crossing
            if (newMin > maxValue) {
              onMaxChange(newMin);
              onMinChange(maxValue);
            } else {
              onMinChange(newMin);
            }
            // Update pixel state for track
            setAPixels(valueToPixels(Math.min(newMin, maxValue)));
            setBPixels(valueToPixels(Math.max(newMin, maxValue)));
          }}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={thumbTintColor}
          style={{ height: 28 }}
        />

        {/* Max slider (thumb only) */}
        <Slider
          value={maxValue}
          onValueChange={(v) => {
            const newMax = Math.round(v / step) * step;
            // Normalize crossing
            if (newMax < minValue) {
              onMinChange(newMax);
              onMaxChange(minValue);
            } else {
              onMaxChange(newMax);
            }
            // Update pixel state for track
            setAPixels(valueToPixels(Math.min(newMax, minValue)));
            setBPixels(valueToPixels(Math.max(newMax, minValue)));
          }}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={thumbTintColor}
          style={{ height: 28, position: 'absolute', left: 0, right: 0 }}
        />
      </View>

      {/* Value labels */}
      {showLabels && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 4,
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.textMuted }}>
            {Math.min(minValue, maxValue)}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.textMuted }}>
            {Math.max(minValue, maxValue)}
          </Text>
        </View>
      )}
    </View>
  );
}
