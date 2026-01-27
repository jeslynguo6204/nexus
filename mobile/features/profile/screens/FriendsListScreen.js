import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../../styles/themeNEW';
import UserProfilePreviewModal from '../components/UserProfilePreviewModal';

const SORT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'school', label: 'School' },
  { id: 'earliest', label: 'Earliest' },
  { id: 'latest', label: 'Latest' },
];

function contextLine(friend) {
  const school = friend.school_short_name || friend.school_name || '';
  const yr = friend.graduation_year != null ? `'${String(friend.graduation_year).slice(-2)}` : null;
  const schoolAndYear = [school, yr].filter(Boolean).join(' ');
  const affs = Array.isArray(friend.featured_affiliation_short_names)
    ? friend.featured_affiliation_short_names.slice(0, 2).filter(Boolean)
    : [];
  const parts = [schoolAndYear, ...affs].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/**
 * Full-screen Friends list: header, search, sort, friend rows.
 * Uses bottom sheets for Sort by and Options (Unfriend).
 */
export default function FriendsListScreen({
  friends = [],
  loading = false,
  onClose,
  onUnfriend,
}) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [optionsFriend, setOptionsFriend] = useState(null);
  const [profilePreviewVisible, setProfilePreviewVisible] = useState(false);
  const [previewUserId, setPreviewUserId] = useState(null);

  const sortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label ?? 'Default';

  const openProfilePreview = (friend) => {
    if (friend?.friend_id) {
      setPreviewUserId(friend.friend_id);
      setProfilePreviewVisible(true);
    }
  };
  const closeProfilePreview = () => {
    setProfilePreviewVisible(false);
    setPreviewUserId(null);
  };

  const openSortSheet = () => setSortSheetVisible(true);
  const closeSortSheet = () => setSortSheetVisible(false);

  const openOptions = (friend) => setOptionsFriend(friend);
  const closeOptions = () => setOptionsFriend(null);

  const handleUnfriendPress = () => {
    const friend = optionsFriend;
    closeOptions();
    if (!friend || !onUnfriend) return;
    const name = friend.display_name || 'this person';
    Alert.alert(
      'Unfriend?',
      `Are you sure you want to unfriend ${name}? You will have to send them a friend request again and you will no longer show up as mutuals with each other.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: () => onUnfriend(friend),
        },
      ]
    );
  };

  const displayedFriends = useMemo(() => {
    let list = [...friends];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (f) =>
          (f.display_name || '').toLowerCase().includes(q) ||
          (f.school_name || '').toLowerCase().includes(q) ||
          (f.school_short_name || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'school':
        list.sort((a, b) => (a.school_name || '').localeCompare(b.school_name || ''));
        break;
      case 'earliest':
        break;
      case 'latest':
        list.reverse();
        break;
      default:
        break;
    }
    return list;
  }, [friends, searchQuery, sortBy]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.divider,
        }}
      >
        <TouchableOpacity onPress={onClose} hitSlop={12} style={{ padding: 8, marginLeft: -8 }}>
          <FontAwesome name="chevron-left" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '700',
            color: COLORS.textPrimary,
          }}
        >
          Friends
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.backgroundSubtle,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <FontAwesome name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor={COLORS.textMuted}
            style={{ flex: 1, fontSize: 16, color: COLORS.textPrimary, paddingVertical: 0 }}
          />
        </View>
      </View>

      {/* Sort by */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.divider,
        }}
      >
        <TouchableOpacity onPress={openSortSheet} activeOpacity={0.7}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: COLORS.textPrimary }}>
            Sort by <Text style={{ fontWeight: '700' }}>{sortLabel}</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openSortSheet} hitSlop={12} style={{ padding: 8 }}>
          <FontAwesome name="sort" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.textPrimary} />
        </View>
      ) : displayedFriends.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 16, color: COLORS.textMuted }}>
            {friends.length === 0 ? 'No friends yet' : 'No matches'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {displayedFriends.map((friend) => {
            const subtitle = contextLine(friend);
            return (
              <View
                key={friend.friend_id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.divider,
                }}
              >
                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}
                  onPress={() => openProfilePreview(friend)}
                >
                  {friend.avatar_url ? (
                    <Image
                      source={{ uri: friend.avatar_url }}
                      style={{ width: 52, height: 52, borderRadius: 26, marginRight: 14 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: COLORS.backgroundSubtle,
                        marginRight: 14,
                      }}
                    />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}
                      numberOfLines={1}
                    >
                      {friend.display_name || 'Unknown'}
                    </Text>
                    {subtitle ? (
                      <Text
                        style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
                <TouchableOpacity
                  onPress={() => openOptions(friend)}
                  hitSlop={12}
                  style={{ padding: 8 }}
                >
                  <FontAwesome name="ellipsis-h" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Sort by bottom sheet */}
      <Modal visible={sortSheetVisible} transparent animationType="fade">
        <Pressable style={sheetOverlay} onPress={closeSortSheet}>
          <Pressable style={[sheetPanel, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={sheetTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => {
                  setSortBy(opt.id);
                  closeSortSheet();
                }}
                style={[sheetRow, sortBy === opt.id && sheetRowActive]}
              >
                <Text style={[sheetRowText, sortBy === opt.id && sheetRowTextActive]}>
                  {opt.label}
                </Text>
                {sortBy === opt.id && (
                  <FontAwesome name="check" size={14} color={COLORS.textPrimary} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Options (Unfriend) bottom sheet */}
      <Modal visible={!!optionsFriend} transparent animationType="fade">
        <Pressable
          style={sheetOverlay}
          onPress={closeOptions}
        >
          <Pressable style={[sheetPanel, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={sheetTitle}>Options</Text>
            <Pressable onPress={handleUnfriendPress} style={sheetRow}>
              <Text style={[sheetRowText, { color: COLORS.danger }]}>Unfriend</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <UserProfilePreviewModal
        visible={profilePreviewVisible}
        userId={previewUserId}
        onClose={closeProfilePreview}
      />
    </View>
  );
}

const sheetOverlay = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
};

const sheetPanel = {
  backgroundColor: COLORS.surface,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: 16,
  paddingTop: 8,
};

const sheetTitle = {
  fontSize: 11,
  fontWeight: '900',
  color: COLORS.textMuted,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  paddingHorizontal: 4,
  paddingVertical: 12,
};

const sheetRow = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderRadius: 12,
};

const sheetRowActive = {
  backgroundColor: 'rgba(0,0,0,0.04)',
};

const sheetRowText = {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.textPrimary,
};

const sheetRowTextActive = {
  fontWeight: '700',
};
