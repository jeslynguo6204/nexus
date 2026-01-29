// mobile/features/likes/screens/LikesScreen.js
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import ModeToggleButton from '../../../navigation/ModeToggleButton';
import { getMyProfile } from '../../../api/profileAPI';
import {
  getPendingFriendRequestsDetailed,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../../api/friendsAPI';
import { getIdToken } from '../../../auth/tokens';

import styles from '../../../styles/ChatStyles';
import homeStyles from '../../../styles/HomeStyles';
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

export default function LikesScreen() {
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [mode, setMode] = useState('romantic');
  const [friendRequests, setFriendRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const hasSetInitialMode = useRef(false);
  const isFirstFocusRef = useRef(true);

  const loadProfile = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const profile = await getMyProfile();
      setMyProfile(profile);
    } catch (e) {
      console.warn('Error loading profile:', e);
      // Don't show alert for network errors - they're expected if server isn't running
      const isNetworkError = e.message?.includes('Network') ||
                            e.message?.includes('fetch') ||
                            e.message?.includes('connection') ||
                            e.message?.includes('ECONNREFUSED');
      if (!isNetworkError) {
        Alert.alert('Error', 'Failed to load profile');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

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

  useEffect(() => {
    if (!myProfile) {
      return;
    }
    
    if (!hasSetInitialMode.current) {
      hasSetInitialMode.current = true;
      if (myProfile.is_dating_enabled && !myProfile.is_friends_enabled) {
        setMode('romantic');
      } else if (myProfile.is_friends_enabled && !myProfile.is_dating_enabled) {
        setMode('platonic');
      }
    } else {
      // After initial load, check if current mode is still valid
      // If current mode was disabled, switch to the other one
      setMode((currentMode) => {
        if (currentMode === 'romantic' && !myProfile.is_dating_enabled) {
          return myProfile.is_friends_enabled ? 'platonic' : currentMode;
        } else if (currentMode === 'platonic' && !myProfile.is_friends_enabled) {
          return myProfile.is_dating_enabled ? 'romantic' : currentMode;
        }
        return currentMode;
      });
    }
  }, [myProfile]);

  // Load profile and friend requests on mount (with loading spinner)
  useEffect(() => {
    loadProfile(true);
    loadFriendRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload profile and friend requests when screen comes back into focus (skip first focus to avoid double load on mount)
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      if (!loading) {
        loadProfile(false);
        loadFriendRequests();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top bar (use ChatStyles so it matches Matches exactly) */}
      <View style={styles.topBar}>
        <Pressable style={styles.brandMark} hitSlop={10}>
          <Text style={styles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={styles.centerSlot}>
          <Text style={styles.title}>Likes</Text>
        </View>

        <ModeToggleButton
          mode={mode}
          onModeChange={setMode}
          isDatingEnabled={myProfile?.is_dating_enabled ?? false}
          isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
        />
      </View>

      {/* Friend Requests Section */}
      <View style={{ flex: 1, backgroundColor: '#F3F7FC' }}>
        {requestsLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : friendRequests.length === 0 ? (
          <View style={homeStyles.emptyWrap}>
            <View style={homeStyles.emptyCard}>
              <Text style={homeStyles.emptyTitle}>No friend requests</Text>
              <Text style={homeStyles.emptySub}>Check back later to see who wants to be friends.</Text>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: COLORS.textPrimary }}>
              Friend Requests ({friendRequests.length})
            </Text>

            {friendRequests.map((request) => {
              const subtitle = contextLine(request);
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

                {/* Action buttons */}
                <View style={{ flexDirection: 'column' }}>
                  <TouchableOpacity
                    onPress={() => handleAcceptRequest(request.requester_id)}
                    disabled={processingRequest === request.requester_id}
                    style={{
                      backgroundColor: COLORS.primary,
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      borderRadius: 12,
                      minWidth: 80,
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                      {processingRequest === request.requester_id ? '...' : 'Accept'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeclineRequest(request.requester_id)}
                    disabled={processingRequest === request.requester_id}
                    style={{
                      backgroundColor: COLORS.surfaceElevated || '#f0f0f0',
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      borderRadius: 12,
                      minWidth: 80,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: COLORS.border || '#e0e0e0',
                    }}
                  >
                    <Text style={{ color: COLORS.textPrimary || '#000', fontWeight: '600', fontSize: 14 }}>
                      {processingRequest === request.requester_id ? '...' : 'Deny'}
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
