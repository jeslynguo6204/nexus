// mobile/screens/HomeScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import SwipeDeck from '../components/SwipeDeck';
import { getFeedProfiles } from '../../../api/feedAPI';
import { getMyProfile } from '../../../api/profileAPI';
import { trackPhotoLike, trackPhotoPass, fetchMyPhotos } from '../../../api/photosAPI';
import { likeUser, passUser } from '../../../api/swipesAPI';
import ModeToggleButton from '../../../navigation/ModeToggleButton';
import mainStyles from '../../../styles/MainPagesStyles';
import styles from '../../../styles/ChatStyles'; // Keep for emptyStateButton
import { getIdToken } from '../../../auth/tokens';
import { getPreferencesUpdated, setPreferencesUpdated } from '../preferencesUpdatedFlag';

const initialProfileSlice = {
  profile: null,
  userId: null,
  photos: [],
  needsProfileSetup: false,
  hasSetInitialMode: false,
  mode: 'romantic',
};

const initialFeedState = {
  profiles: [],
  currentIndex: 0,
  loading: true,
  loadingFeed: false,
};

export default function HomeScreen({ navigation, route }) {
  // Single state objects so one setState per "phase" = fewer re-renders (RN may not batch async setState)
  const [profileSlice, setProfileSlice] = useState(initialProfileSlice);
  const [feedState, setFeedState] = useState(initialFeedState);

  const { profile: myProfile, userId: myUserId, photos: myPhotos, needsProfileSetup, hasSetInitialMode, mode } = profileSlice;
  const { profiles, currentIndex, loading, loadingFeed } = feedState;

  const setMode = useCallback((valueOrUpdater) => {
    setProfileSlice((prev) => ({
      ...prev,
      mode: typeof valueOrUpdater === 'function' ? valueOrUpdater(prev.mode) : valueOrUpdater,
    }));
  }, []);
  const isLoadingFeedRef = useRef(false);
  const lastLoadedModeRef = useRef(null);
  const isMountedRef = useRef(false);
  const isFirstDiscoverFocusRef = useRef(true);
  const previousProfileStateRef = useRef({
    gender: null,
    dating_gender_preference: null,
    friends_gender_preference: null,
    location_description: null,
    school_id: null,
  });

  const loadFeed = useCallback(async (isInitialLoad = false) => {
    if (isLoadingFeedRef.current || lastLoadedModeRef.current === mode) {
      return;
    }
    if (needsProfileSetup) {
      return;
    }

    isLoadingFeedRef.current = true;
    if (!isInitialLoad) setFeedState((prev) => ({ ...prev, loadingFeed: true }));
    lastLoadedModeRef.current = mode;
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      const fetchedProfiles = await getFeedProfiles(token, mode, 'school');
      const list = Array.isArray(fetchedProfiles) ? fetchedProfiles : [];
      setFeedState((prev) => ({
        ...prev,
        profiles: list,
        currentIndex: 0,
        loading: isInitialLoad ? false : prev.loading,
        loadingFeed: false,
      }));
    } catch (e) {
      console.warn('Error loading feed:', e);
      console.warn('Error details:', e.message);
      // Log the full error response if available
      if (e.response) {
        try {
          const errorData = await e.response.json();
          console.warn('Error response data:', errorData);
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON');
        }
      }
      // Don't show alert for network errors - they're expected if server isn't running
      const isNetworkError = e.message?.includes('Network') || 
                            e.message?.includes('fetch') || 
                            e.message?.includes('connection') ||
                            e.message?.includes('ECONNREFUSED');
      if (!isNetworkError) {
        Alert.alert('Error', String(e.message || e));
      }
      // Reset on error so we can retry
      lastLoadedModeRef.current = null;
      setFeedState((prev) => ({
        ...prev,
        loading: isInitialLoad ? false : prev.loading,
        loadingFeed: false,
      }));
    } finally {
      isLoadingFeedRef.current = false;
    }
  }, [mode, needsProfileSetup]);

  const loadProfile = useCallback(async () => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      // Fetch my profile and photos
      const profile = await getMyProfile();
      const photos = await fetchMyPhotos(token);
      
      if (isMountedRef.current) {
        const hasNoPhotos = !photos || photos.length === 0;
        const hasNoModes = !profile?.is_dating_enabled && !profile?.is_friends_enabled;
        const hasNoGender = !profile?.gender;
        const needsProfileSetupVal = hasNoGender || hasNoPhotos || hasNoModes;

        const initialMode =
          profile?.is_dating_enabled && !profile?.is_friends_enabled
            ? 'romantic'
            : profile?.is_friends_enabled && !profile?.is_dating_enabled
              ? 'platonic'
              : 'romantic';

        const prevState = previousProfileStateRef.current;
        const newState = {
          gender: profile?.gender,
          dating_gender_preference: profile?.dating_gender_preference,
          friends_gender_preference: profile?.friends_gender_preference,
          location_description: profile?.location_description,
          school_id: profile?.school_id,
        };
        const eligibilityChanged =
          prevState.gender !== newState.gender ||
          prevState.dating_gender_preference !== newState.dating_gender_preference ||
          prevState.friends_gender_preference !== newState.friends_gender_preference ||
          prevState.location_description !== newState.location_description ||
          prevState.school_id !== newState.school_id;

        if (eligibilityChanged && prevState.gender !== null && !loading && hasSetInitialMode) {
          lastLoadedModeRef.current = null;
          loadFeed();
        }
        previousProfileStateRef.current = newState;

        setProfileSlice({
          profile,
          userId: profile?.user_id ?? null,
          photos: photos || [],
          needsProfileSetup: needsProfileSetupVal,
          hasSetInitialMode: true,
          mode: initialMode,
        });
        if (needsProfileSetupVal) setFeedState((prev) => ({ ...prev, loading: false }));
      }
    } catch (e) {
      console.warn('Error loading profile:', e);
      // Don't show alert for network errors - they're expected if server isn't running
      const isNetworkError = e.message?.includes('Network') || 
                            e.message?.includes('fetch') || 
                            e.message?.includes('connection') ||
                            e.message?.includes('ECONNREFUSED');
      if (!isNetworkError && isMountedRef.current) {
        Alert.alert('Error', String(e.message || e));
      }
    }
  }, [loading, hasSetInitialMode, loadFeed]);

  useEffect(() => {
    isMountedRef.current = true;
    loadProfile();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Only refresh feed when preferences were updated (user saved on Profile; they stay on Profile, we refresh next time they open this tab)
  useFocusEffect(
    useCallback(() => {
      if (!getPreferencesUpdated() || loading) return;
      setPreferencesUpdated(false);
      loadProfile();
    }, [loading, loadProfile])
  );

  // Refetch feed when returning to Discover so friendship status (e.g. after accepting on card or Friends screen) is up to date
  useFocusEffect(
    useCallback(() => {
      if (isFirstDiscoverFocusRef.current) {
        isFirstDiscoverFocusRef.current = false;
        return;
      }
      if (!loading && myProfile && hasSetInitialMode) {
        lastLoadedModeRef.current = null;
        loadFeed();
      }
    }, [loading, myProfile, hasSetInitialMode, loadFeed])
  );

  // After first load, validate mode when profile updates (e.g. user disabled a mode on Profile)
  useEffect(() => {
    if (!myProfile || !hasSetInitialMode) return;
    const nextMode =
      mode === 'romantic' && !myProfile.is_dating_enabled
        ? (myProfile.is_friends_enabled ? 'platonic' : mode)
        : mode === 'platonic' && !myProfile.is_friends_enabled
          ? (myProfile.is_dating_enabled ? 'romantic' : mode)
          : mode;
    if (nextMode !== mode) {
      setProfileSlice((prev) => ({ ...prev, mode: nextMode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile]);

  // Load feed once when profile and mode are ready
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (needsProfileSetup) return;
    if (!myProfile || !hasSetInitialMode || lastLoadedModeRef.current === mode) return;
    loadFeed(loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, myProfile, mode, hasSetInitialMode, needsProfileSetup]);

  if (__DEV__) console.log('HomeScreen render', { currentUserId: myUserId });

  function moveToNextCard() {
    setFeedState((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
  }

  async function handleSwipeRight(profile, photoIndex = 0) {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');
      
      if (__DEV__) console.log('Like', { currentUserId: myUserId, viewingProfileId: profile?.user_id, mode });
      
      // Record the like (dating_likes or friend_likes depending on mode)
      const likeResult = await likeUser(token, profile?.user_id, mode);
      
      // Track the like on the photo that was being viewed
      if (profile?.photos && profile.photos[photoIndex]?.id) {
        await trackPhotoLike(token, profile.photos[photoIndex].id);
      }
      
      // Check if it's a match
      if (likeResult?.isMatch) {
        if (__DEV__) console.log('Match', { currentUserId: myUserId, matchedProfileId: profile?.user_id });
        Alert.alert(
          'It\'s a Match! 🎉', 
          `You and ${profile?.display_name || 'this user'} liked each other!`
        );
      }
      
      // moveToNextCard is handled by onNext callback from SwipeDeck
    } catch (e) {
      console.warn(e);
      // Don't show alert for tracking failures
      if (e.message !== 'Not signed in') {
        console.warn('Error processing like:', e);
      } else {
        Alert.alert('Error', String(e.message || e));
      }
    }
  }

  async function handleSwipeLeft(profile, photoIndex = 0) {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');
      
      if (__DEV__) console.log('Pass', { currentUserId: myUserId, viewingProfileId: profile?.user_id, mode });
      
      // Record the pass (dating_passes or friend_passes depending on mode)
      await passUser(token, profile?.user_id, mode);
      
      // Track the pass on the photo that was being viewed
      if (profile?.photos && profile.photos[photoIndex]?.id) {
        await trackPhotoPass(token, profile.photos[photoIndex].id);
      }
      
      // moveToNextCard is handled by onNext callback from SwipeDeck
    } catch (e) {
      console.warn(e);
      // Don't show alert for tracking failures
      if (e.message !== 'Not signed in') {
        console.warn('Error processing pass:', e);
      } else {
        Alert.alert('Error', String(e.message || e));
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const current = profiles[currentIndex];

  return (
    <SafeAreaView style={mainStyles.container} edges={['top', 'left', 'right']}>
      {/* Top bar */}
      <View style={mainStyles.topBar}>
        <Pressable style={mainStyles.brandMark} hitSlop={10}>
          <Text style={mainStyles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={mainStyles.titleCenteredWrap}>
          <Text style={mainStyles.title}>Discover</Text>
        </View>

        <ModeToggleButton
          mode={mode}
          onModeChange={setMode}
          isDatingEnabled={myProfile?.is_dating_enabled ?? false}
          isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
        />
      </View>

      {needsProfileSetup ? (
        <View style={mainStyles.emptyWrap}>
          <View style={mainStyles.emptyCard}>
            <Text style={mainStyles.emptyTitle}>
              Finish building your profile to start swiping!
            </Text>
            <Text style={mainStyles.emptySub}>
              Make sure your profile has at least one photo and that you have enabled at least one swiping mode.
            </Text>
          </View>
          <Pressable
            style={styles.emptyStateButton}
            onPress={() => navigation?.navigate?.('Profile', { openPreferences: true })}
          >
            <Text style={styles.emptyStateButtonText}>Complete my profile</Text>
          </Pressable>
        </View>
      ) : loadingFeed ? (
        <View style={mainStyles.emptyWrap}>
          <ActivityIndicator />
        </View>
      ) : current ? (
        <SwipeDeck
          profiles={profiles}
          currentIndex={currentIndex}
          currentUserId={myUserId}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onNext={moveToNextCard}
        />
      ) : (
        <View style={mainStyles.emptyWrap}>
          <View style={mainStyles.emptyCard}>
            <Text style={mainStyles.emptyTitle}>
              That's all for now!
            </Text>
            <Text style={mainStyles.emptySub}>Check back later for new profiles.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
