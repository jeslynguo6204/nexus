import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import io from 'socket.io-client';

import styles from '../../../styles/ChatStyles'; // Keep for chatRow, matchItem, etc.
import mainStyles from '../../../styles/MainPagesStyles';
import { getChats, getAllMatches } from '../../../api/matchesAPI';
import { getMyProfile } from '../../../api/profileAPI';
import ModeToggleButton from '../../../navigation/ModeToggleButton';
import { useMode } from '../../../contexts/ModeContext';
import { getIdToken } from '../../../auth/tokens';

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

export default function InboxScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [hasLoadedMatches, setHasLoadedMatches] = useState(false);
  const [hasLoadedChats, setHasLoadedChats] = useState(false);

  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const { mode, setMode, hasSetInitialMode, setHasSetInitialMode } = useMode();
  const isLoadingRef = useRef(false);
  const socketRef = useRef(null);
  const joinedMatchesRef = useRef(new Set());
  const matchesRef = useRef([]);
  const profileRef = useRef(null);
  const modeRef = useRef(mode);

  const API_BASE = useMemo(() => {
    return Constants?.expoConfig?.extra?.apiBaseUrl || 'https://sixdegrees.dev';
  }, []);

  useEffect(() => {
    matchesRef.current = matches;
  }, [matches]);

  useEffect(() => {
    profileRef.current = myProfile;
  }, [myProfile]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const handleIncomingMessage = useCallback((msg) => {
    const currentMode = modeRef.current;
    if (msg?.mode && msg.mode !== currentMode) return;
    if (!msg?.match_id) return;
    const matchId = msg.match_id.toString();
    const currentProfile = profileRef.current;
    const isMine = currentProfile?.user_id && msg.sender_user_id === currentProfile.user_id;
    const preview = msg.body || '';
    const timeLabel = formatTimeAgo(msg.created_at);
    const currentMatches = matchesRef.current || [];

    setChats((prevChats) => {
      const others = prevChats.filter((c) => String(c.id) !== matchId);
      const existing = prevChats.find((c) => String(c.id) === matchId);
      const matchMeta = currentMatches.find((m) => String(m.id) === matchId);

      const base = existing || matchMeta || {};
      const updated = {
        id: matchId,
        match_user_id: base.match_user_id,
        display_name: base.display_name || 'Chat',
        avatar_url: base.avatar_url || 'https://picsum.photos/200?99',
        chat_id: msg.chat_id || base.chat_id || null,
        last_message: preview,
        time: timeLabel,
        unread: isMine ? false : true,
      };

      return [updated, ...others];
    });
  }, []);

  const loadInboxData = useCallback(async (showLoading = false) => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      // Fetch my profile (always fetch to ensure it's up to date)
      const profile = await getMyProfile();
      setMyProfile(profile);

      // Fetch all matches (for top row - includes no-chat-yet)
      const allMatches = await getAllMatches(token, mode);

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
          chat_id: m.chat_id,
        })
      );

      setMatches(formattedMatches);
      setHasLoadedMatches(true);

      // Fetch active chats (for message list)
      const fetchedChats = await getChats(token, mode);
      
      // Normalize shape for UI
      const formattedChats = (Array.isArray(fetchedChats) ? fetchedChats : []).map(
        (c) => ({
          id: String(c.id),
          match_user_id: c.match_user_id,
          display_name: c.display_name || 'Chat',
          avatar_url:
            c.avatar_url ||
            'https://picsum.photos/200?99',
          chat_id: c.chat_id,
          last_message: c.last_message_preview || 'No messages yet',
          time: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null,
          unread: false, // TODO: implement unread status when messages are fetched
        })
      );

      // Sticky cards: only replace with non-empty results; otherwise keep existing unless first load
      setChats((prev) => {
        if (formattedChats.length > 0) return formattedChats;
        if (!hasLoadedChats) return formattedChats; // first load can be empty
        return prev; // keep previous cards if new fetch is empty
      });
      setHasLoadedChats(true);
    } catch (e) {
      console.warn('Error loading inbox:', e);
      // Don't show alert for network errors - they're expected if server isn't running
      const isNetworkError = e.message?.includes('Network') || 
                            e.message?.includes('fetch') || 
                            e.message?.includes('connection') ||
                            e.message?.includes('ECONNREFUSED');
      if (!isNetworkError) {
        Alert.alert('Error', 'Failed to load inbox');
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [mode]);

  // Connect to the socket server for realtime chat previews
  useEffect(() => {
    let isMounted = true;
    const connect = async () => {
      try {
        const token = await getIdToken();
        if (!token || !isMounted) return;

        const socket = io(API_BASE, {
          transports: ['websocket'],
          auth: { token },
        });
        socketRef.current = socket;

        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));
        socket.on('message', handleIncomingMessage);
      } catch (e) {
        console.warn('Inbox socket connection failed', e);
      }
    };

    connect();
    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [API_BASE]);

  // Reset joined-room tracking when mode changes
  useEffect(() => {
    joinedMatchesRef.current = new Set();
  }, [mode]);

  // Join a room for every known match so we receive new message events
  useEffect(() => {
    if (!socketRef.current || !socketConnected) return;
    const joined = joinedMatchesRef.current;

    matches.forEach((m) => {
      const idStr = String(m.id);
      if (joined.has(idStr)) return;
      socketRef.current.emit('join_chat', { matchId: m.id, mode });
      joined.add(idStr);
    });
  }, [matches, mode, socketConnected]);

  // Set initial mode once when profile is loaded, and update if modes change
  useEffect(() => {
    if (!myProfile) {
      return;
    }
    
    if (!hasSetInitialMode) {
      setHasSetInitialMode(true);
      if (myProfile.is_dating_enabled && !myProfile.is_friends_enabled) {
        setMode('romantic');
      } else if (myProfile.is_friends_enabled && !myProfile.is_dating_enabled) {
        setMode('platonic');
      }
      // If both are enabled, keep default 'romantic' (or could check if user had a preference)
    } else {
      // After initial load, ONLY update mode if current mode was disabled
      // Don't reset mode if both modes are enabled - preserve user's current selection
      setMode((currentMode) => {
        if (currentMode === 'romantic' && !myProfile.is_dating_enabled) {
          // Romantic mode was disabled, switch to platonic if available
          return myProfile.is_friends_enabled ? 'platonic' : currentMode;
        } else if (currentMode === 'platonic' && !myProfile.is_friends_enabled) {
          // Platonic mode was disabled, switch to romantic if available
          return myProfile.is_dating_enabled ? 'romantic' : currentMode;
        }
        // Both modes are enabled or current mode is still valid - preserve current selection
        return currentMode;
      });
    }
  }, [myProfile, hasSetInitialMode, setMode, setHasSetInitialMode]);

  // Load data on mount (with loading spinner)
  useEffect(() => {
    loadInboxData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload data when screen comes into focus (e.g., after unmatching or preference changes) - silent refresh
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadInboxData(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, mode, loadInboxData])
  );

  // Reload inbox data when mode changes
  useEffect(() => {
    if (!loading && myProfile && hasSetInitialMode) {
      loadInboxData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const onOpenChat = (chatOrMatch) => {
    navigation.navigate('ChatScreen', {
      id: chatOrMatch.id,
      match_user_id: chatOrMatch.match_user_id,
      display_name: chatOrMatch.display_name,
      avatar_url: chatOrMatch.avatar_url,
      matched_at: chatOrMatch.created_at || '5/15/24',
      chat_id: chatOrMatch.chat_id || null,
      mode: mode, // Pass current mode
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
      <Pressable onPress={() => onOpenChat(item)} style={styles.chatCard} hitSlop={6}>
        <Image source={{ uri: item.avatar_url }} style={styles.chatAvatar} />

        <View style={styles.chatText}>
          <Text style={[styles.chatName, unread && styles.unreadName]}>
            {item.display_name}
          </Text>

          <Text
            style={[
              styles.chatPreview,
              unread ? styles.unreadPreview : styles.readPreview,
            ]}
            numberOfLines={1}
          >
            {item.last_message}
          </Text>
        </View>

        <View style={styles.timeWrap}>
          {!!item.time && (
            <Text
              style={[
                styles.timeText,
                unread ? styles.unreadTime : styles.readTime,
              ]}
            >
              {item.time}
            </Text>
          )}
          {unread ? <View style={styles.unreadDot} /> : <View style={styles.dotSpacer} />}
        </View>
      </Pressable>
    );
  };

  if (loading || !hasLoadedMatches || !hasLoadedChats) {
    return (
      <SafeAreaView style={mainStyles.container}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // If no matches, show centered empty state
  if (matches.length === 0) {
    return (
      <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
        {/* Top bar */}
        <View style={mainStyles.topBar}>
          <Pressable style={mainStyles.brandMark} hitSlop={10}>
            <Text style={mainStyles.brandMarkText}>6°</Text>
          </Pressable>

          <View style={mainStyles.titleCenteredWrap}>
            <Text style={mainStyles.title}>Matches</Text>
          </View>

          <ModeToggleButton
            mode={mode}
            onModeChange={setMode}
            isDatingEnabled={myProfile?.is_dating_enabled ?? false}
            isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
          />
        </View>

        {/* Centered empty state for no matches */}
        <View style={mainStyles.emptyWrap}>
          <View style={mainStyles.emptyCard}>
            <Text style={mainStyles.emptyTitle}>No matches yet</Text>
            <Text style={mainStyles.emptySub}>Start swiping to find matches!</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.emptyStateButtonText}>Start swiping!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
      {/* Top bar */}
      <View style={mainStyles.topBar}>
        <Pressable style={mainStyles.brandMark} hitSlop={10}>
          <Text style={mainStyles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={mainStyles.titleCenteredWrap}>
          <Text style={mainStyles.title}>Matches</Text>
        </View>

        <ModeToggleButton
          mode={mode}
          onModeChange={setMode}
          isDatingEnabled={myProfile?.is_dating_enabled ?? false}
          isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
        />
      </View>

      {/* Matches row */}
      <View style={styles.matchesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchesRow}
        >
          {matches.map(renderMatch)}
        </ScrollView>
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
          style={{ flex: 1 }}
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
