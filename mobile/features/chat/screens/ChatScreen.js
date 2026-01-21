import React, { useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendMessage as sendMessageAPI } from '../../../api/messagesAPI';

const DEFAULT_AVATAR = 'https://picsum.photos/200?88';

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

export default function ChatScreen({ navigation, route }) {
  // Expect route params from InboxScreen:
  // { match_user_id, display_name, avatar_url, matched_at }
  const matchId = route?.params?.id; // The match ID for sending messages
  const matchUserId = route?.params?.match_user_id;
  const displayName = route?.params?.display_name ?? 'Noah';
  const avatarUrl = route?.params?.avatar_url ?? DEFAULT_AVATAR;
  const matchedAtRaw = route?.params?.matched_at ?? '5/15/24';
  const matchedAt = formatMatchDate(matchedAtRaw);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // Hard-coded starter conversation
  const [messages, setMessages] = useState(() => [
    {
      id: 'm1',
      type: 'system',
      text: `YOU MATCHED WITH ${displayName.toUpperCase()} ON ${matchedAt}`,
    },
    {
      id: 'm2',
      type: 'incoming',
      text: "Sample chat message! This is an example of how your messages will look.",
    },
    // Add an outgoing sample if you want:
    // { id: 'm3', type: 'outgoing', text: "haha thank you 😭 how's your day going?" },
  ]);

  const listRef = useRef(null);

  const dataForList = useMemo(() => {
    // FlatList inverted wants newest first (index 0)
    // We'll invert ourselves so it still renders naturally.
    return [...messages].reverse();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      // Call backend to send message (creates chat if needed)
      const result = await sendMessageAPI(matchId, trimmed);
      
      // Create local message object
      const newMsg = {
        id: `m_${Date.now()}`,
        type: 'outgoing',
        text: trimmed,
      };

      setMessages((prev) => [...prev, newMsg]);
      setText('');

      // Optionally scroll to bottom (works well with inverted list)
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemRow}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const incoming = item.type === 'incoming';
    return (
      <View style={[styles.messageRow, incoming ? styles.leftRow : styles.rightRow]}>
        {incoming ? (
          <Image source={{ uri: avatarUrl }} style={styles.bubbleAvatar} />
        ) : (
          <View style={styles.bubbleAvatarSpacer} />
        )}

        <View style={[styles.bubble, incoming ? styles.incomingBubble : styles.outgoingBubble]}>
          <Text style={[styles.bubbleText, incoming ? styles.incomingText : styles.outgoingText]}>
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

          <View style={styles.headerCenter}>
            <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            <Text style={styles.headerName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <Pressable hitSlop={12} style={styles.moreBtn}>
            <Text style={styles.moreGlyph}>•••</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={dataForList}
          keyExtractor={(x) => x.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

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
    height: 72,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDEDED',
  },
  headerName: {
    marginTop: 6,
    fontSize: 16,
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
});
