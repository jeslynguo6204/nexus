import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '@/styles/themeNEW';
import editProfileStyles from '@/styles/EditProfileStyles';

function toDisplayItems(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return a.map(String).filter((s) => s.trim().length > 0);
}

/**
 * Row for Likes or Dislikes: label left, dot-separated items (profile-card style) + chevron right.
 * Tappable; use onPress to open Likes/Dislikes edit screen.
 */
export default function LikesDislikesRow({ label, items, onPress }) {
  const display = toDisplayItems(items);
  const showPlaceholder = display.length === 0;

  return (
    <>
      <TouchableOpacity
        style={editProfileStyles.rowTouchable}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text style={editProfileStyles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          {showPlaceholder ? (
            <Text style={[editProfileStyles.rowValue, editProfileStyles.rowValueMuted]}>
              Tap to add
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                paddingRight: 8,
              }}
              style={{ flex: 1 }}
            >
              {display.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 ? (
                    <View
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: 999,
                        backgroundColor: COLORS.textMuted,
                        opacity: 0.6,
                        marginHorizontal: 6,
                      }}
                    />
                  ) : null}
                  <Text
                    style={{ fontSize: 16, fontWeight: '400', color: COLORS.textPrimary }}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                </React.Fragment>
              ))}
            </ScrollView>
          )}
          <View style={editProfileStyles.rowChevron}>
            <FontAwesome name="chevron-right" size={14} color={COLORS.textMuted} />
          </View>
        </View>
      </TouchableOpacity>
      <View style={editProfileStyles.rowDivider} />
    </>
  );
}
