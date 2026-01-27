import React from 'react';
import { View, Text, Switch } from 'react-native';
import editProfileStyles from '@/styles/EditProfileStyles';
import { COLORS } from '@/styles/themeNEW';

/**
 * Preferences-style row: label (optional subtitle) left, Switch right.
 * Uses same padding and divider as EditProfileRow.
 */
export default function EditProfileToggleRow({
  label,
  subtitle,
  value,
  onValueChange,
}) {
  return (
    <>
      <View style={editProfileStyles.toggleRow}>
        <View style={editProfileStyles.toggleRowLabelWrap}>
          <Text style={editProfileStyles.toggleRowLabel} numberOfLines={1}>
            {label}
          </Text>
          {subtitle ? (
            <Text style={editProfileStyles.toggleRowSubtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Switch
          value={!!value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.divider, true: COLORS.textPrimary }}
          thumbColor={value ? '#555555' : '#CCCCCC'}
        />
      </View>
      <View style={editProfileStyles.rowDivider} />
    </>
  );
}
