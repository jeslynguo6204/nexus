import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../../../styles/ChatStyles';
import { getChats, getAllMatches } from '../../../api/matchesAPI';

// Helper to format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return 'older';
  } catch (e) {
    return null;
  }
};

// Hard-coded sample chat to simulate starting a chat with a match
// This represents what it looks like when you start a chat with someone
const HARDCODED_STARTED_CHAT = [
  {
    id: 'c1',
    match_user_id: 'match_123',
    display_name: 'Alex',
    avatar_url: 'https://picsum.photos/200?31',
    last_message: 'You started the conversation',
    time: 'now',
    unread: false,
  },
  {
    id: 'c2',
    match_user_id: 'match_456',
    display_name: 'Paige',
    avatar_url: 'https://picsum.photos/200?32',
    last_message: 'You started the conversation',
    time: 'now',
    unread: false,
  },
];

export default function InboxScreen({ navigation }) {
  const [loading, setLoading] = useState(true);

  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState([]);

  const loadInboxData = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      // Fetch all matches (for top row - includes no-chat-yet)
      const allMatches = await getAllMatches(token);

      // Normalize shape for UI
      const formattedMatches = (Array.isArray(allMatches) ? allMatches : []).map(
        (m) => ({
          id: String(m.id),
          match_user_id: m.match_user_id,
          display_name: m.display_name || 'Match',
          avatar_url:
            m.avatar_url ||
            'https://picsum.photos/200?99',
          created_at: m.created_at,
        })
      );

      setMatches(formattedMatches);

      // Fetch active chats (for message list)
      const fetchedChats = await getChats(token);
      
      // Normalize shape for UI
      const formattedChats = (Array.isArray(fetchedChats) ? fetchedChats : []).map(
        (c) => ({
          id: String(c.id),
          match_user_id: c.match_user_id,
          display_name: c.display_name || 'Chat',
          avatar_url:
            c.avatar_url ||
            'https://picsum.photos/200?99',
          last_message: c.last_message_preview || 'No messages yet',
          time: c.last_message_at ? formatTimeAgo(c.last_message_at) : null,
          unread: false, // TODO: implement unread status when messages are fetched
        })
      );

      // For now, use hardcoded chat to see what it looks like when you start a chat
      // TODO: Remove this when real messaging is implemented
      setChats(formattedChats.length > 0 ? formattedChats : HARDCODED_STARTED_CHAT);
    } catch (e) {
      console.warn('Error loading inbox:', e);
      Alert.alert('Error', 'Failed to load inbox');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount (with loading spinner)
  useEffect(() => {
    loadInboxData(true);
  }, [loadInboxData]);

  // Reload data when screen comes into focus (e.g., after unmatching) - silent refresh
  useFocusEffect(
    useCallback(() => {
      loadInboxData(false);
    }, [loadInboxData])
  );

  const onOpenChat = (chatOrMatch) => {
    navigation.navigate('ChatScreen', {
      id: chatOrMatch.id,
      match_user_id: chatOrMatch.match_user_id,
      display_name: chatOrMatch.display_name,
      avatar_url: chatOrMatch.avatar_url,
      matched_at: chatOrMatch.created_at || '5/15/24',
    });
  };

  const renderMatch = (m) => (
    <Pressable
      key={m.id}
      onPress={() => onOpenChat(m)}
      style={styles.matchItem}
      hitSlop={8}
    >
      <Image source={{ uri: m.avatar_url }} style={styles.matchAvatar} />
      <Text style={styles.matchName} numberOfLines={1}>
        {m.display_name}
      </Text>
    </Pressable>
  );

  const renderChatRow = ({ item }) => {
    const unread = !!item.unread;

    return (
      <Pressable onPress={() => onOpenChat(item)} style={styles.chatRow} hitSlop={6}>
        <Image source={{ uri: item.avatar_url }} style={styles.chatAvatar} />

        <View style={styles.chatText}>
          <Text style={[styles.chatName, unread && styles.unreadName]}>
            {item.display_name}
          </Text>

          <View style={styles.previewRow}>
            <Text
              style={[
                styles.chatPreview,
                unread ? styles.unreadPreview : styles.readPreview,
              ]}
              numberOfLines={1}
            >
              {item.last_message}
            </Text>

            {!!item.time && (
              <Text
                style={[
                  styles.timeText,
                  unread ? styles.unreadTime : styles.readTime,
                ]}
              >
                {' '}
                · {item.time}
              </Text>
            )}
          </View>
        </View>

        {unread ? <View style={styles.unreadDot} /> : <View style={styles.dotSpacer} />}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.brandMark} hitSlop={10}>
          <Text style={styles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={styles.centerSlot}>
          <Text style={styles.title}>Matches</Text>
        </View>

        {/* Right side left empty for now (keeps spacing similar to your Home top bar) */}
        <View style={styles.rightSlot} />
      </View>

      {/* Matches row */}
      <View style={styles.matchesSection}>
        {matches.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchesRow}
          >
            {matches.map(renderMatch)}
          </ScrollView>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No matches yet</Text>
            <Text style={styles.emptyStateSubtext}>Start swiping to find matches!</Text>
          </View>
        )}
      </View>

      {/* Messages header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>Messages</Text>
      </View>

      {/* Chats */}
      {chats.length > 0 ? (
        <FlatList
          data={chats}
          keyExtractor={(x) => String(x.id)}
          renderItem={renderChatRow}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>Start a conversation with one of your matches!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
