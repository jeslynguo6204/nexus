// mobile/features/likes/screens/LikesScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import ModeToggleButton from '../../../navigation/ModeToggleButton';
import { getMyProfile } from '../../../api/profileAPI';
import { getReceivedLikes } from '../../../api/swipesAPI';
import { getIdToken } from '../../../auth/tokens';
import MiniProfileCard from '../components/MiniProfileCard';
import UserProfilePreviewModal from '../../profile/components/UserProfilePreviewModal';

import mainStyles from '../../../styles/MainPagesStyles';
import { COLORS } from '../../../styles/themeNEW';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARDS_PER_ROW = 3;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) / CARDS_PER_ROW;

export default function LikesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [mode, setMode] = useState('romantic');
  const [receivedLikes, setReceivedLikes] = useState([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [previewUserId, setPreviewUserId] = useState(null);
  const [profilePreviewVisible, setProfilePreviewVisible] = useState(false);
  const hasSetInitialMode = useRef(false);
  const isFirstFocusRef = useRef(true);
  const loadReceivedLikesRef = useRef(loadReceivedLikes);
  loadReceivedLikesRef.current = loadReceivedLikes;

  const loadProfile = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const profile = await getMyProfile();
      setMyProfile(profile);
    } catch (e) {
      console.warn('Error loading profile:', e);
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

  const loadReceivedLikes = useCallback(async () => {
    try {
      setLikesLoading(true);
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      const profiles = await getReceivedLikes(token, mode);
      setReceivedLikes(profiles);
    } catch (e) {
      console.warn('Error loading received likes:', e);
      const isNetworkError = e.message?.includes('Network') ||
                            e.message?.includes('fetch') ||
                            e.message?.includes('connection') ||
                            e.message?.includes('ECONNREFUSED');
      if (!isNetworkError) {
        Alert.alert('Error', 'Failed to load likes');
      }
    } finally {
      setLikesLoading(false);
    }
  }, [mode]);

  const handleProfilePress = useCallback((profile) => {
    if (profile?.user_id) {
      setPreviewUserId(profile.user_id);
      setProfilePreviewVisible(true);
    }
  }, []);

  const closeProfilePreview = useCallback(() => {
    setProfilePreviewVisible(false);
    setPreviewUserId(null);
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

  // Load profile on mount
  useEffect(() => {
    loadProfile(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load received likes when mode changes, or once when profile becomes available (stable deps: user_id not object ref)
  useEffect(() => {
    if (!myProfile) return;
    loadReceivedLikes();
  }, [mode, myProfile?.user_id, loadReceivedLikes]);

  // Reload likes when screen comes back into focus (stable callback so no refetch loop)
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      loadReceivedLikesRef.current?.();
    }, [])
  );

  const renderRow = (rowIndex) => {
    const rowItems = [];
    for (let i = 0; i < CARDS_PER_ROW; i++) {
      const profileIndex = rowIndex * CARDS_PER_ROW + i;
      if (profileIndex < receivedLikes.length) {
        rowItems.push(
          <View key={profileIndex} style={{ width: CARD_WIDTH }}>
            <MiniProfileCard
              profile={receivedLikes[profileIndex]}
              onPress={() => handleProfilePress(receivedLikes[profileIndex])}
            />
          </View>
        );
      } else {
        // Empty space to maintain grid alignment
        rowItems.push(<View key={`empty-${i}`} style={{ width: CARD_WIDTH }} />);
      }
    }
    return (
      <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: CARD_GAP }}>
        {rowItems}
      </View>
    );
  };

  const numRows = Math.ceil(receivedLikes.length / CARDS_PER_ROW);

  if (loading) {
    return (
      <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} />
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
          <Text style={mainStyles.title}>Likes</Text>
        </View>

        <ModeToggleButton
          mode={mode}
          onModeChange={setMode}
          isDatingEnabled={myProfile?.is_dating_enabled ?? false}
          isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
        />
      </View>

      {/* Likes content */}
      <View style={mainStyles.content}>
        {likesLoading ? (
          <View style={mainStyles.emptyWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : receivedLikes.length === 0 ? (
          <View style={mainStyles.emptyWrap}>
            <View style={mainStyles.emptyCard}>
              <Text style={mainStyles.emptyTitle}>No likes yet</Text>
              <Text style={mainStyles.emptySub}>
                {mode === 'romantic' 
                  ? "People who like you will appear here."
                  : "People who want to be friends will appear here."}
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              padding: CARD_PADDING,
              paddingBottom: CARD_PADDING + 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {Array.from({ length: numRows }, (_, i) => renderRow(i))}
          </ScrollView>
        )}
      </View>

      <UserProfilePreviewModal
        visible={profilePreviewVisible}
        userId={previewUserId}
        onClose={closeProfilePreview}
      />
    </SafeAreaView>
  );
}
