import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  TextInput,
  InputAccessoryView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  DeviceEventEmitter,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { sendMessage as sendMessageAPI, getMessages, markMessagesAsRead } from '../../../api/messagesAPI';
import { unmatchUser as unmatchUserAPI } from '../../../api/matchesAPI';
import { formatUserError, logAppError } from '../../../utils/errors';
import { blockUser } from '../../../api/blocksAPI';
import BlockReportSheet from '../../home/components/BlockReportSheet';
import UserProfilePreviewModal from '../../profile/components/UserProfilePreviewModal';
import { getIdToken } from '../../../auth/tokens';
import { getMyProfile } from '../../../api/profileAPI';
import { fetchMyPhotos } from '../../../api/photosAPI';
import Constants from 'expo-constants';
import io from 'socket.io-client';

const DEFAULT_AVATAR = 'https://picsum.photos/200?88';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Animated typing dots component
function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  return (
    <View style={typingStyles.dots}>
      <Animated.View style={[typingStyles.dot, { opacity: dot1 }]} />
      <Animated.View style={[typingStyles.dot, { opacity: dot2 }]} />
      <Animated.View style={[typingStyles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const typingStyles = StyleSheet.create({
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#9CA3AF' },
});

const formatTimestamp = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (diffDays === 0) {
      return `Today at ${time}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${time}`;
    } else {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${dayName}, ${monthName} ${day} at ${time}`;
    }
  } catch (e) {
    return '';
  }
};

const formatMatchDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `You matched on ${monthName} ${day}, ${year}`;
  } catch (e) {
    return '';
  }
};

const POPOVER_W = 200;
const POPOVER_H = 180;
const EDGE = 12;

export default function ChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  
  // Expect route params from InboxScreen:
  // { match_user_id, display_name, avatar_url, matched_at, mode }
  const matchId = route?.params?.id; // The match ID for sending messages
  const matchUserId = route?.params?.match_user_id;
  const displayName = route?.params?.display_name ?? 'Noah';
  const mode = route?.params?.mode || 'romantic'; // Get mode from route params
  const avatarUrl = route?.params?.avatar_url ?? DEFAULT_AVATAR;
  // Use actual current date/time if no matched_at is provided
  const matchedAtRaw = route?.params?.matched_at && route?.params?.matched_at !== '5/15/24'
    ? route?.params?.matched_at
    : new Date().toISOString();
  const initialChatId = route?.params?.chat_id || null;

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const myUserIdRef = useRef(null);
  const chatIdRef = useRef(initialChatId);
  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);
  const [myAvatarUrl, setMyAvatarUrl] = useState(DEFAULT_AVATAR);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const isFocused = useIsFocused();
  const isFocusedRef = useRef(true);
  useEffect(() => { isFocusedRef.current = isFocused; }, [isFocused]);

  // Menu popover state
  const [menuOpen, setMenuOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const moreBtnRef = useRef(null);
  
  // Block/Report sheet state
  const [blockReportSheetOpen, setBlockReportSheetOpen] = useState(false);
  const [blockReportMode, setBlockReportMode] = useState(null); // 'block' or 'report'

  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const listRef = useRef(null);

  const openMenu = () => {
    requestAnimationFrame(() => {
      if (!moreBtnRef.current?.measureInWindow) {
        setMenuOpen(true);
        return;
      }

      moreBtnRef.current.measureInWindow((x, y, w, h) => {
        const { width: winW, height: winH } = Dimensions.get('window');

        // Align popover right edge with button right edge
        let left = x + w - POPOVER_W;
        let top = y + h + 8;

        // Clamp inside visible area (respect safe areas)
        left = clamp(left, EDGE, winW - POPOVER_W - EDGE);
        top = clamp(top, insets.top + EDGE, winH - POPOVER_H - EDGE);

        setPopoverPos({ top, left });
        setMenuOpen(true);
      });
    });
  };

  const handleUnmatch = async () => {
    setMenuOpen(false);
    
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${displayName}? This will delete your conversation and you won't be able to message them again.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getIdToken();
              if (!token) throw new Error('Not signed in');

              await unmatchUserAPI(token, matchId, mode);
              
              // Navigate back to inbox
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to unmatch. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBlock = async () => {
    setMenuOpen(false);
    
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${displayName}? You won't be able to see each other or message anymore.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getIdToken();
              if (!token) throw new Error('Not signed in');

              // Block the user
              await blockUser(token, matchUserId);
              
              // Also unmatch them (blocking should remove the match)
              try {
                await unmatchUserAPI(token, matchId, mode);
              } catch (unmatchError) {
                // Continue even if unmatch fails
              }
              
              Alert.alert('Success', 'User blocked successfully', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate back to inbox
                    navigation.goBack();
                  },
                },
              ]);
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Error', error.message || 'Failed to block user. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    setMenuOpen(false);
    setBlockReportMode('report');
    setBlockReportSheetOpen(true);
  };
  
  const handleReportSubmitted = () => {
    setBlockReportSheetOpen(false);
    setBlockReportMode(null);
  };

  const handleViewProfile = () => {
    setProfileModalVisible(true);
  };

  const addMessageFromServer = (msg) => {
    if (!msg) return;
    const getId = (m) => {
      if (m.id != null) return String(m.id);
      if (m.tempId) return String(m.tempId);
      return null;
    };

    const baseId = getId(msg);
    const id = baseId || `m_${Date.now()}`;
    const normalized = {
      id,
      tempId: msg.tempId,
      body: msg.body,
      created_at: msg.created_at,
      sender_user_id: msg.sender_user_id,
      read_at: msg.read_at,
      status: 'sent',
    };

    setMessages((prev) => {
      // If this incoming message matches an optimistic pending one (same body, same sender, pending), replace it.
      const pendingIdx = prev.findIndex(
        (m) =>
          m.status === 'pending' &&
          m.sender_user_id === normalized.sender_user_id &&
          m.body === normalized.body
      );
      if (pendingIdx >= 0) {
        const next = prev.slice();
        next[pendingIdx] = { ...prev[pendingIdx], ...normalized };
        return next;
      }

      // If this is fulfilling an optimistic message, replace by tempId
      if (normalized.tempId) {
        const replaced = prev.map((m) =>
          m.tempId === normalized.tempId ? { ...m, ...normalized } : m
        );
        const exists = replaced.some((m) => {
          const mid = getId(m);
          return mid && mid === id;
        });
        return exists ? replaced : [...replaced, { ...normalized, id }];
      }

      const exists = prev.some((m) => {
        const mid = getId(m);
        return mid && mid === id;
      });
      if (exists) return prev;
      return [...prev, { ...normalized, id }];
    });
  };

  const dataForList = useMemo(() => {
    const sorted = [...messages].reverse(); // oldest to newest
    const result = [];
    const TIME_GAP_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    // Find the most recent outgoing message index (sorted is newest-first)
    let lastOutgoingIdx = -1;
    for (let i = 0; i < sorted.length; i++) {
      if (myUserId && String(sorted[i].sender_user_id) === String(myUserId)) {
        lastOutgoingIdx = i;
        break;
      }
    }

    sorted.forEach((m, index) => {
      const isOutgoing = myUserId && String(m.sender_user_id) === String(myUserId);
      // Add the message first
      result.push({
        key: m.id || m.tempId,
        id: m.id || m.tempId,
        text: m.body,
        created_at: m.created_at,
        read_at: m.read_at,
        type: isOutgoing ? 'outgoing' : 'incoming',
        status: m.status,
        isLastOutgoing: index === lastOutgoingIdx,
      });

      // Then check if we need a divider AFTER this message (which appears ABOVE it when inverted)
      const nextMessage = sorted[index + 1];
      if (nextMessage) {
        const currentTime = new Date(m.created_at).getTime();
        const nextTime = new Date(nextMessage.created_at).getTime();

        // If there's a 3+ hour gap to the next message, insert a divider
        if ((nextTime - currentTime) > TIME_GAP_THRESHOLD) {
          result.push({
            key: `divider_${nextMessage.id || nextMessage.tempId}`,
            type: 'date_divider',
            date: nextMessage.created_at,
          });
        }
      }
    });

    return result;
  }, [messages, myUserId]);

  // Emit typing/stop_typing events with debouncing
  const handleTextChange = useCallback((value) => {
    setText(value);
    const socket = socketRef.current;
    if (!socket) return;

    const payload = { chatId, matchId };

    if (value.length > 0 && !isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', payload);
    }

    // Clear previous timeout and set a new one
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socket.emit('stop_typing', payload);
      }
    }, 2000);

    // If user cleared the input, stop typing immediately
    if (value.length === 0 && isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit('stop_typing', payload);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  }, [chatId, matchId]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Stop typing indicator on send
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketRef.current?.emit('stop_typing', { chatId, matchId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    const tempId = `tmp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      tempId,
      body: trimmed,
      created_at: new Date().toISOString(),
      sender_user_id: myUserId,
      status: 'pending',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const markStatus = (status) => {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...m, status } : m))
      );
    };

    try {
      const socket = socketRef.current;
      if (socket && socket.connected) {
        let acked = false;
        const fallbackTimer = setTimeout(async () => {
          if (acked) return;
          try {
            const result = await sendMessageAPI(matchId, trimmed, mode);
            if (result.message) {
              addMessageFromServer({ ...result.message, sender_user_id: myUserId, tempId });
              markStatus('sent');
            } else {
              markStatus('failed');
            }
          } catch (err) {
            markStatus('failed');
            Alert.alert('Error', 'Failed to send message. Please try again.');
          } finally {
            setSending(false);
          }
        }, 3000);

        socket.emit(
          'send_message',
          { matchId, body: trimmed, mode, tempId },
          (resp) => {
            acked = true;
            clearTimeout(fallbackTimer);
            if (!resp?.ok) {
              markStatus('failed');
              logAppError(resp?.error, { screen: 'Chat', action: 'sendMessage' });
              Alert.alert('Error', formatUserError(resp?.error, 'Failed to send message.'));
              setSending(false);
              return;
            }
            const msg = { ...resp.message, tempId };
            setChatId(resp.chatId || chatId);
            addMessageFromServer(msg);
            markStatus('sent');
            setSending(false);
          }
        );
      } else {
        const result = await sendMessageAPI(matchId, trimmed, mode);
        setChatId(result.chatId || chatId);
        if (result.message) {
          addMessageFromServer({ ...result.message, sender_user_id: myUserId, tempId });
          markStatus('sent');
        } else {
          const newMsg = {
            id: tempId,
            tempId,
            body: trimmed,
            created_at: new Date().toISOString(),
            sender_user_id: myUserId,
            status: 'pending',
          };
          addMessageFromServer(newMsg);
        }
      }
      setText('');

      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Mark optimistic message as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId ? { ...m, status: 'failed' } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const API_BASE = useMemo(() => {
    return Constants?.expoConfig?.extra?.apiBaseUrl || 'https://sixdegrees.dev';
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const profile = await getMyProfile();
        setMyUserId(profile?.user_id);
        myUserIdRef.current = profile?.user_id;
        let avatar = null;
        // Prefer primary photo from photos API (sorted by sort_order)
        try {
          const token = await getIdToken();
          if (token) {
            const photos = await fetchMyPhotos(token);
            const primary = photos.find((p) => p.is_primary);
            avatar = primary?.url || photos[0]?.url || null;
          }
        } catch (photoErr) {
          // Silently fail — avatar will use default
        }
        if (!avatar && Array.isArray(profile?.photos)) {
          avatar = profile.photos[0] || null;
        }
        setMyAvatarUrl(avatar || DEFAULT_AVATAR);
      } catch (e) {
        // Silently fail
      }
    };
    fetchMe();
  }, []);

  const loadHistory = useCallback(async () => {
    if (!chatId || !myUserId) return;
    setLoadingHistory(true);
    try {
      const rows = await getMessages(chatId, mode);
      const normalized = rows
        .slice()
        .reverse()
        .map((m) => ({
          id: m.id.toString(),
          body: m.body,
          created_at: m.created_at,
          sender_user_id: m.sender_user_id,
          read_at: m.read_at,
        }));
      setMessages(normalized);

      // Mark messages as read after loading (only if chatId exists)
      if (chatId) {
        try {
          const result = await markMessagesAsRead(chatId, mode);
          // Only decrement badge if we actually marked something new
          if (result?.markedCount > 0) {
            DeviceEventEmitter.emit('refreshUnreadCount');
          }
        } catch (markError) {
          // Silently fail
        }
      }
    } catch (e) {
      // Silently fail
    } finally {
      setLoadingHistory(false);
    }
  }, [chatId, mode, myUserId]);

  // Load history when identifiers change, but skip initial chatId creation
  const prevChatIdRef = useRef(initialChatId);
  useEffect(() => {
    // Don't reload history if chatId just went from null to a value
    // (this happens when sending the first message)
    if (prevChatIdRef.current === null && chatId !== null) {
      prevChatIdRef.current = chatId;
      return;
    }
    prevChatIdRef.current = chatId;
    loadHistory();
  }, [loadHistory, chatId]);

  // Keep navigation params updated with resolved chatId so future navigations have it
  useEffect(() => {
    if (chatId && route?.params?.chat_id !== chatId) {
      navigation.setParams({ chat_id: chatId });
    }
  }, [chatId, navigation, route?.params?.chat_id]);

  // Reload history whenever the chat screen regains focus (ensures "sticky" history)
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  useEffect(() => {
    let isMounted = true;
    const connectSocket = async () => {
      try {
        const token = await getIdToken();
        if (!isMounted) return;
        const socket = io(API_BASE, {
          transports: ['websocket'],
          auth: { token },
        });
        socketRef.current = socket;

        socket.on('connect', () => {});
        socket.on('disconnect', () => {});
        socket.on('message', (msg) => {
          addMessageFromServer(msg);
          // Only auto-mark as read if the screen is actually focused (visible)
          // React Navigation keeps screens mounted in the background
          if (!isFocusedRef.current) return;
          const currentChatId = chatIdRef.current;
          const myId = myUserIdRef.current;
          if (currentChatId && myId && String(msg.chat_id) === String(currentChatId) && String(msg.sender_user_id) !== String(myId)) {
            markMessagesAsRead(currentChatId, mode).then((result) => {
              if (result?.markedCount > 0) {
                DeviceEventEmitter.emit('refreshUnreadCount');
              }
            }).catch(() => {});
          }
        });

        // Listen for read receipts
        socket.on('messages_read', (data) => {
          if (String(data.readBy) === String(myUserIdRef.current)) {
            return;
          }
          const currentChatId = chatIdRef.current;
          if (String(data.chatId) !== String(currentChatId)) {
            return;
          }
          // Only mark OUR outgoing messages as read (not incoming ones)
          const myId = myUserIdRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              myId && String(m.sender_user_id) === String(myId) && !m.read_at
                ? { ...m, read_at: new Date().toISOString() }
                : m
            )
          );
        });

        // Typing indicator listeners
        socket.on('typing', (data) => {
          if (data.userId !== myUserIdRef.current) {
            setOtherUserTyping(true);
          }
        });
        socket.on('stop_typing', (data) => {
          if (data.userId !== myUserIdRef.current) {
            setOtherUserTyping(false);
          }
        });

        socket.emit('join_chat', { matchId, mode }, (resp) => {
          if (resp?.ok && resp.chatId && !chatId) {
            setChatId(resp.chatId);
          }
        });
      } catch (e) {
        // Silently fail
      }
    };
    connectSocket();
    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, [API_BASE, matchId, mode]);

  const renderItem = ({ item }) => {
    if (item.type === 'date_divider') {
      return (
        <View style={styles.dateDividerRow}>
          <Text style={styles.dateDividerText}>{formatTimestamp(item.date)}</Text>
        </View>
      );
    }

    if (item.type === 'system') {
      return (
        <View style={styles.systemRow}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const incoming = item.type === 'incoming';
    const dimmed = item.status === 'pending' || item.status === 'failed';
    if (incoming) {
      return (
        <View style={[styles.messageRow, styles.leftRow]}>
          <Image source={{ uri: avatarUrl }} style={styles.bubbleAvatar} />
          <View style={[
            styles.bubble,
            styles.incomingBubble,
            dimmed && styles.pendingBubble
          ]}>
            <Text style={[
              styles.bubbleText,
              styles.incomingText,
              dimmed && styles.pendingText
            ]}>
              {item.text}
            </Text>
          </View>
        </View>
      );
    }

    const isRead = !!item.read_at;
    const showStatus = item.isLastOutgoing && item.status !== 'pending' && item.status !== 'failed';

    return (
      <View>
        <View style={[styles.messageRow, styles.rightRow]}>
          <View style={[
            styles.bubble,
            styles.outgoingBubble,
            dimmed && styles.pendingBubble
          ]}>
            <Text style={[
              styles.bubbleText,
              styles.outgoingText,
              dimmed && styles.pendingText
            ]}>
              {item.text}
            </Text>
          </View>
          <Image source={{ uri: myAvatarUrl }} style={[styles.bubbleAvatar, styles.bubbleAvatarRight]} />
        </View>
        {showStatus && (
          <View style={styles.readReceiptContainer}>
            <Text style={styles.readReceiptText}>
              {isRead ? 'Read' : 'Sent'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>

          <Pressable style={styles.headerCenter} onPress={handleViewProfile}>
            <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
          </Pressable>

          <Pressable 
            ref={moreBtnRef}
            onPress={openMenu}
            hitSlop={12} 
            style={styles.moreBtn}
          >
            <Text style={styles.moreGlyph}>•••</Text>
          </Pressable>
        </View>

        {/* Menu popover */}
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <Pressable style={styles.popoverOverlay} onPress={() => setMenuOpen(false)}>
            <Pressable
              onPress={() => {}}
              style={[
                styles.menuPopover,
                { width: POPOVER_W, top: popoverPos.top, left: popoverPos.left },
              ]}
            >
              <Pressable
                onPress={handleUnmatch}
                style={styles.menuRow}
              >
                <Text style={[styles.menuRowText, styles.menuRowTextDestructive]}>
                  Unmatch
                </Text>
              </Pressable>

              <View style={styles.menuSeparator} />

              <Pressable
                onPress={handleBlock}
                style={styles.menuRow}
              >
                <Text style={[styles.menuRowText, styles.menuRowTextDestructive]}>
                  Block
                </Text>
              </Pressable>

              <Pressable
                onPress={handleReport}
                style={styles.menuRow}
              >
                <Text style={styles.menuRowText}>
                  Report
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Block/Report Sheet */}
        {blockReportMode === 'report' && (
          <BlockReportSheet
            visible={blockReportSheetOpen}
            onClose={() => {
              setBlockReportSheetOpen(false);
              setBlockReportMode(null);
            }}
            userId={matchUserId}
            userName={displayName}
            onBlocked={handleReportSubmitted}
            initialMode="report"
          />
        )}

        <UserProfilePreviewModal
          visible={profileModalVisible}
          userId={matchUserId}
          onClose={() => setProfileModalVisible(false)}
        />

        {/* Messages */}
        {loadingHistory && messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={dataForList}
            keyExtractor={(x, idx) => x.key || `row_${idx}`}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            ListFooterComponent={
              <View style={styles.conversationStartContainer}>
                <Text style={styles.conversationStartText}>
                  {formatMatchDate(matchedAtRaw)}
                </Text>
              </View>
            }
          />
        )}

        {/* Typing indicator */}
        {otherUserTyping && (
          <View style={styles.typingRow}>
            <Image source={{ uri: avatarUrl }} style={styles.typingAvatar} />
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
          </View>
        )}

        {/* Composer */}
        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={handleTextChange}
              placeholder="Type a message"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline={false}
              inputAccessoryViewID="chatInput"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              editable={!sending}
            />

            <Pressable 
              onPress={sendMessage} 
              hitSlop={10} 
              style={styles.sendBtn}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#111111" />
              ) : (
                <Text style={[styles.sendText, text.trim() ? styles.sendActive : styles.sendInactive]}>
                  Send
                </Text>
              )}
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID="chatInput">
          <View />
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    height: 96,
    paddingHorizontal: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backGlyph: {
    fontSize: 34,
    lineHeight: 34,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDEDED',
  },
  headerName: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  moreBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  moreGlyph: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '800',
  },

  // List
  listContent: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  systemRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  systemText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Message rows
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  leftRow: {
    justifyContent: 'flex-start',
  },
  rightRow: {
    justifyContent: 'flex-end',
  },

  bubbleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDEDED',
    marginRight: 8,
    marginBottom: 2,
  },
  bubbleAvatarSpacer: {
    width: 32,
    marginRight: 8,
  },
  bubbleAvatarRight: {
    marginLeft: 8,
    marginRight: 0,
  },

  bubble: {
    maxWidth: '72%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  incomingBubble: {
    backgroundColor: '#E9EAEE', // light gray like screenshot
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
  },
  outgoingBubble: {
    backgroundColor: '#111111', // simple contrast; tweak if you want iMessage blue
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },

  bubbleText: {
    fontSize: 16,
    lineHeight: 20,
  },
  incomingText: {
    color: '#111111',
    fontWeight: '600',
  },
  outgoingText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timestamp: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  timestampIncoming: {
    color: '#6B7280',
  },
  timestampOutgoing: {
    color: 'rgba(255,255,255,0.7)',
  },
  readText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  readReceiptContainer: {
    alignItems: 'flex-end',
    paddingRight: 40,
    marginTop: 1,
    marginBottom: 2,
  },
  readReceiptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dateDividerRow: {
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 4,
  },
  dateDividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conversationStartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingTop: 24,
  },
  conversationStartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  reactionStub: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingBottom: 6,
  },
  reactionStubText: {
    fontSize: 22,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  reactionStubSpacer: {
    width: 34,
    marginLeft: 8,
  },
  pendingBubble: {
    opacity: 0.7,
  },
  pendingText: {
    opacity: 0.6,
  },

  // Composer
  composerWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
  },
  composer: {
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 0,
  },
  sendBtn: {
    paddingLeft: 10,
    paddingVertical: 6,
  },
  sendText: {
    fontSize: 16,
    fontWeight: '800',
  },
  sendActive: {
    color: '#111111',
  },
  sendInactive: {
    color: '#9CA3AF',
  },

  // Optional tools row
  // Menu popover
  popoverOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  menuPopover: {
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  menuRowTextDestructive: {
    color: '#EF4444',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 4,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: '#E9EAEE',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
