import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import editProfileStyles from '@/styles/EditProfileStyles';
import { COLORS } from '@/styles/themeNEW';

function RowDivider() {
  return <View style={editProfileStyles.rowDivider} />;
}

/**
 * Instagram-style form row: label left, value/control right.
 * - Use with children for custom right content (input, chips).
 * - Use value/placeholder/onPress for selector rows (value + chevron, tappable).
 * - alignTop: use for multiline inputs (e.g. Bio).
 */
export default function EditProfileRow({
  label,
  children,
  value,
  placeholder = 'Not selected',
  onPress,
  alignTop = false,
}) {
  const isSelector = typeof onPress === 'function';
  const showPlaceholder = !value || (Array.isArray(value) && value.length === 0);
  const displayText = Array.isArray(value) ? value.join(', ') : (value || '');

  const rowStyle = alignTop
    ? [editProfileStyles.row, { alignItems: 'flex-start' }]
    : editProfileStyles.row;
  const touchStyle = alignTop
    ? [editProfileStyles.rowTouchable, { alignItems: 'flex-start' }]
    : editProfileStyles.rowTouchable;

  if (isSelector) {
    return (
      <>
        <TouchableOpacity
          style={touchStyle}
          onPress={onPress}
          activeOpacity={0.6}
        >
          <Text style={editProfileStyles.rowLabel} numberOfLines={1}>
            {label}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              editProfileStyles.rowValue,
              showPlaceholder && editProfileStyles.rowValueMuted,
            ]}
          >
            {showPlaceholder ? placeholder : displayText}
          </Text>
          <View style={editProfileStyles.rowChevron}>
            <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
          </View>
        </TouchableOpacity>
        <RowDivider />
      </>
    );
  }

  return (
    <>
      <View style={rowStyle}>
        <Text style={[editProfileStyles.rowLabel, alignTop && { marginTop: 2 }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
      <RowDivider />
    </>
  );
}
