import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { sendMessage as sendMessageAPI, getMessages } from '../../../api/messagesAPI';
import { unmatchUser as unmatchUserAPI } from '../../../api/matchesAPI';
import { blockUser } from '../../../api/blocksAPI';
import BlockReportSheet from '../../home/components/BlockReportSheet';
import UserProfilePreviewModal from '../../profile/components/UserProfilePreviewModal';
import { getIdToken } from '../../../auth/tokens';
import { getMyProfile } from '../../../api/profileAPI';
import Constants from 'expo-constants';
import io from 'socket.io-client';

const DEFAULT_AVATAR = 'https://picsum.photos/200?88';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const formatMatchDate = (dateString) => {
  if (!dateString) return '5/15/24';
  try {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${day}/${year}`;
  } catch (e) {
    return dateString;
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
  const matchedAtRaw = route?.params?.matched_at ?? '5/15/24';
  const matchedAt = formatMatchDate(matchedAtRaw);
  const initialChatId = route?.params?.chat_id || null;

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  
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
              console.error('Error unmatching:', error);
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
                console.warn('Error unmatching after block:', unmatchError);
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
    return [...messages].reverse().map((m) => ({
      key: m.id || m.tempId,
      id: m.id || m.tempId,
      text: m.body,
      created_at: m.created_at,
      type: myUserId && m.sender_user_id === myUserId ? 'outgoing' : 'incoming',
      status: m.status,
    }));
  }, [messages, myUserId]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    console.log('[chat] send tapped', { matchId, mode, len: trimmed.length, socketConnected });
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
        console.log('[chat] sending via socket', { matchId, mode, tempId });
        let acked = false;
        const fallbackTimer = setTimeout(async () => {
          if (acked) return;
          console.log('[chat] socket ack timeout; falling back to HTTP', { matchId, mode, tempId });
          try {
            const result = await sendMessageAPI(matchId, trimmed, mode);
            if (result.message) {
              addMessageFromServer({ ...result.message, sender_user_id: myUserId, tempId });
              markStatus('sent');
            } else {
              markStatus('failed');
            }
          } catch (err) {
            console.warn('[chat] http fallback failed', err);
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
              console.warn('[chat] socket send failed', resp);
              markStatus('failed');
              Alert.alert('Error', resp?.error || 'Failed to send message.');
              setSending(false);
              return;
            }
            const msg = { ...resp.message, tempId };
            setChatId(resp.chatId || chatId);
            addMessageFromServer(msg);
            console.log('[chat] socket ack', { chatId: resp.chatId, messageId: resp.message?.id });
            markStatus('sent');
            setSending(false);
          }
        );
      } else {
        // Fallback to HTTP (still works, but no realtime)
        console.log('[chat] sending via HTTP', { matchId, mode, tempId });
        const result = await sendMessageAPI(matchId, trimmed, mode);
        setChatId(result.chatId || chatId);
        if (result.message) {
          addMessageFromServer({ ...result.message, sender_user_id: myUserId, tempId });
          console.log('[chat] http response', { chatId: result.chatId, messageId: result.message?.id });
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
      console.error('Error sending message:', error);
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
      } catch (e) {
        console.warn('Failed to load profile for chat', e);
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
        }));
      setMessages(normalized);
    } catch (e) {
      console.warn('Failed to load messages', e);
    } finally {
      setLoadingHistory(false);
    }
  }, [chatId, mode, myUserId]);

  // Load history when identifiers change
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

        socket.on('connect', () => {
          console.log('[chat] socket connected');
          setSocketConnected(true);
        });
        socket.on('disconnect', () => {
          console.log('[chat] socket disconnected');
          setSocketConnected(false);
        });
        socket.on('connect_error', (err) => {
          console.warn('[chat] socket connect_error', err?.message || err);
        });
        socket.on('error', (err) => {
          console.warn('[chat] socket error', err?.message || err);
        });
        socket.on('message', addMessageFromServer);

        socket.emit('join_chat', { matchId, mode }, (resp) => {
          if (resp?.ok && resp.chatId && !chatId) {
            setChatId(resp.chatId);
            console.log('[chat] joined room', resp);
          }
        });
      } catch (e) {
        console.warn('Socket connection failed', e);
      }
    };
    connectSocket();
    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
    };
  }, [API_BASE, matchId, mode]);

  const renderItem = ({ item }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemRow}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const incoming = item.type === 'incoming';
    const dimmed = item.status === 'pending' || item.status === 'failed';
    return (
      <View style={[styles.messageRow, incoming ? styles.leftRow : styles.rightRow]}>
        {incoming ? (
          <Image source={{ uri: avatarUrl }} style={styles.bubbleAvatar} />
        ) : (
          <View style={styles.bubbleAvatarSpacer} />
        )}

        <View style={[
          styles.bubble,
          incoming ? styles.incomingBubble : styles.outgoingBubble,
          dimmed && styles.pendingBubble
        ]}>
          <Text style={[
            styles.bubbleText,
            incoming ? styles.incomingText : styles.outgoingText,
            dimmed && styles.pendingText
          ]}>
            {item.text}
          </Text>
        </View>

        {/* Right side (for icons like heart in your screenshot). Keeping subtle placeholder. */}
        {incoming ? (
          <Pressable hitSlop={10} style={styles.reactionStub}>
            <Text style={styles.reactionStubText}>♡</Text>
          </Pressable>
        ) : (
          <View style={styles.reactionStubSpacer} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
            keyExtractor={(x, idx) => x.id || x.key || `row_${idx}`}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Composer */}
        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline={false}
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

          {/* Optional “tools row” placeholder like GIF/music/etc.
              Keep subtle; remove if you don’t want it.
          */}
          <View style={styles.toolsRow}>
            <View style={styles.toolPill}>
              <Text style={styles.toolText}>GIF</Text>
            </View>
            <View style={styles.toolCircle} />
            <View style={styles.toolCircle} />
            <View style={styles.toolCircle} />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: 80,
    paddingHorizontal: 12,
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
    paddingBottom: 10,
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
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  toolPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
  },
  toolCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F7',
  },

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
});
