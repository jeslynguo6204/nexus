// mobile/features/friends/screens/FriendsScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import {
  getPendingFriendRequestsDetailed,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../../api/friendsAPI';
import { getIdToken } from '../../../auth/tokens';

import mainStyles from '../../../styles/MainPagesStyles';
import { COLORS } from '../../../styles/themeNEW';

function contextLine(request) {
  const school = request.school_short_name || request.school_name || '';
  const yr = request.graduation_year != null ? `'${String(request.graduation_year).slice(-2)}` : null;
  const schoolAndYear = [school, yr].filter(Boolean).join(' ');
  const affs = Array.isArray(request.featured_affiliation_short_names)
    ? request.featured_affiliation_short_names.slice(0, 2).filter(Boolean)
    : [];
  const parts = [schoolAndYear, ...affs].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export default function FriendsScreen() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const isFirstFocusRef = useRef(true);

  const loadFriendRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      const requests = await getPendingFriendRequestsDetailed(token);
      setFriendRequests(requests);
    } catch (e) {
      console.warn('Error loading friend requests:', e);
      const isNetworkError = e.message?.includes('Network') ||
                            e.message?.includes('fetch') ||
                            e.message?.includes('connection') ||
                            e.message?.includes('ECONNREFUSED');
      if (!isNetworkError) {
        Alert.alert('Error', 'Failed to load friend requests');
      }
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const handleAcceptRequest = useCallback(async (requesterId) => {
    try {
      setProcessingRequest(requesterId);
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      await acceptFriendRequest(token, requesterId);

      // Remove from list
      setFriendRequests((prev) => prev.filter((req) => req.requester_id !== requesterId));

      Alert.alert('Success', 'Friend request accepted!');
    } catch (e) {
      console.error('Error accepting friend request:', e);
      Alert.alert('Error', 'Failed to accept friend request');
    } finally {
      setProcessingRequest(null);
    }
  }, []);

  const handleDeclineRequest = useCallback(async (requesterId) => {
    try {
      setProcessingRequest(requesterId);
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      await declineFriendRequest(token, requesterId);

      // Remove from list
      setFriendRequests((prev) => prev.filter((req) => req.requester_id !== requesterId));
    } catch (e) {
      console.error('Error declining friend request:', e);
      Alert.alert('Error', 'Failed to decline friend request');
    } finally {
      setProcessingRequest(null);
    }
  }, []);

  // Load friend requests on mount
  useEffect(() => {
    loadFriendRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload friend requests when screen comes back into focus (skip first focus to avoid double load on mount)
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      loadFriendRequests();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
      {/* Top bar */}
      <View style={mainStyles.topBar}>
        <Pressable style={mainStyles.brandMark} hitSlop={10}>
          <Text style={mainStyles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={mainStyles.titleCenteredWrap}>
          <Text style={mainStyles.title}>Friends</Text>
        </View>

        <TouchableOpacity
          style={mainStyles.rightSlotIconButton}
          onPress={() => Alert.alert('Friends', 'More options coming soon.')}
          hitSlop={8}
        >
          <FontAwesome name="bars" size={20} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Friend requests */}
      <View style={mainStyles.content}>
        {requestsLoading ? (
          <View style={mainStyles.emptyWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : friendRequests.length === 0 ? (
          <View style={mainStyles.emptyWrap}>
            <View style={mainStyles.emptyCard}>
              <Text style={mainStyles.emptyTitle}>No friend requests</Text>
              <Text style={mainStyles.emptySub}>Check back later to see who wants to be friends.</Text>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: COLORS.textPrimary }}>
              Friend Requests ({friendRequests.length})
            </Text>

            {friendRequests.map((request) => {
              const subtitle = contextLine(request);
              const isProcessing = processingRequest === request.requester_id;
              const btnHeight = 30;
              const btnPaddingH = 12;
              const acceptStyle = {
                height: btnHeight,
                paddingHorizontal: btnPaddingH,
                borderRadius: btnHeight / 2,
                backgroundColor: 'rgba(15, 59, 97, 0.8)',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 72,
                marginBottom: 6,
              };
              const denyStyle = {
                height: btnHeight,
                paddingHorizontal: btnPaddingH,
                borderRadius: btnHeight / 2,
                backgroundColor: 'rgba(156, 163, 175, 0.8)',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 72,
              };
              const btnTextStyle = {
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.2,
              };
              return (
              <View
                key={request.request_id}
                style={{
                  backgroundColor: COLORS.surface || '#fff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {/* Avatar */}
                {request.avatar_url ? (
                  <Image
                    source={{ uri: request.avatar_url }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginRight: 12,
                      backgroundColor: COLORS.surfaceElevated || '#f0f0f0',
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      marginRight: 12,
                      backgroundColor: COLORS.surfaceElevated || '#f0f0f0',
                    }}
                  />
                )}

                {/* Info */}
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary || '#000' }}>
                    {request.display_name}
                  </Text>
                  {subtitle ? (
                    <Text style={{ fontSize: 14, color: COLORS.textMuted || '#666', marginTop: 2 }}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>

                {/* Action buttons — pill style matching Discover friend chip */}
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => handleAcceptRequest(request.requester_id)}
                    disabled={isProcessing}
                    style={acceptStyle}
                    activeOpacity={0.85}
                  >
                    <Text style={btnTextStyle}>
                      {isProcessing ? '...' : 'Accept'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeclineRequest(request.requester_id)}
                    disabled={isProcessing}
                    style={denyStyle}
                    activeOpacity={0.85}
                  >
                    <Text style={btnTextStyle}>
                      {isProcessing ? '...' : 'Deny'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
