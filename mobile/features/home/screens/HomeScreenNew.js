// mobile/screens/HomeScreenNew.js
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import SwipeDeckNew from '../components/SwipeDeckNew';
import { getFeedProfiles } from '../../../api/feedAPI';
import { getMyProfile } from '../../../api/profileAPI';
import { trackPhotoLike, trackPhotoPass } from '../../../api/photosAPI';
import { likeUser, passUser } from '../../../api/swipesAPI';
import ModeToggleButton from '../../../navigation/ModeToggleButton';
import styles from '../../../styles/HomeStylesNew';
import chatStyles from '../../../styles/ChatStyles';

export default function HomeScreenNew() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myUserId, setMyUserId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [mode, setMode] = useState('romantic'); // romantic | platonic
  const [hasSetInitialMode, setHasSetInitialMode] = useState(false);
  const isLoadingFeedRef = useRef(false);
  const lastLoadedModeRef = useRef(null);
  const isMountedRef = useRef(false);
  const previousGenderPrefsRef = useRef({ dating: null, friends: null });

  const loadFeed = useCallback(async () => {
    // Prevent multiple simultaneous loads or loading the same mode twice
    if (isLoadingFeedRef.current || lastLoadedModeRef.current === mode) {
      return;
    }
    
    isLoadingFeedRef.current = true;
    setLoadingFeed(true);
    lastLoadedModeRef.current = mode;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      // Fetch feed profiles with current mode (default scope: school)
      const fetchedProfiles = await getFeedProfiles(token, mode, 'school');
      setProfiles(Array.isArray(fetchedProfiles) ? fetchedProfiles : []);
      setCurrentIndex(0);
    } catch (e) {
      console.warn('Error loading feed:', e);
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
    } finally {
      isLoadingFeedRef.current = false;
      setLoadingFeed(false);
    }
  }, [mode]);

  const loadProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      // Fetch my profile
      const profile = await getMyProfile(token);
      if (isMountedRef.current) {
        const prevPrefs = previousGenderPrefsRef.current;
        const newPrefs = {
          dating: profile?.dating_gender_preference,
          friends: profile?.friends_gender_preference,
        };
        
        // Check if gender preferences changed - if so, reload feed
        const prefsChanged = 
          prevPrefs.dating !== newPrefs.dating || 
          prevPrefs.friends !== newPrefs.friends;
        
        if (prefsChanged && prevPrefs.dating !== null && !loading && hasSetInitialMode) {
          // Preferences changed, reload feed
          lastLoadedModeRef.current = null; // Reset to force reload
          loadFeed();
        }
        
        previousGenderPrefsRef.current = newPrefs;
        setMyProfile(profile);
        setMyUserId(profile?.user_id);
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
    loadProfile().finally(() => {
      if (isMountedRef.current) {
        setLoading(false);
      }
    });
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reload profile when screen comes into focus (to pick up preference changes)
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadProfile();
      }
    }, [loadProfile, loading])
  );

  // Set initial mode once when profile is loaded, and update if modes change
  useEffect(() => {
    if (!myProfile) {
      return;
    }
    
    // Set initial mode on first load
    if (!hasSetInitialMode) {
      setHasSetInitialMode(true);
      setMode((currentMode) => {
        if (myProfile.is_dating_enabled && !myProfile.is_friends_enabled) {
          return 'romantic';
        } else if (myProfile.is_friends_enabled && !myProfile.is_dating_enabled) {
          return 'platonic';
        }
        return currentMode;
      });
    } else {
      // After initial load, check if current mode is still valid
      // If current mode was disabled, switch to the other one
      setMode((currentMode) => {
        if (currentMode === 'romantic' && !myProfile.is_dating_enabled) {
          // Romantic mode disabled, switch to platonic if available
          return myProfile.is_friends_enabled ? 'platonic' : currentMode;
        } else if (currentMode === 'platonic' && !myProfile.is_friends_enabled) {
          // Platonic mode disabled, switch to romantic if available
          return myProfile.is_dating_enabled ? 'romantic' : currentMode;
        }
        return currentMode;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile]);

  // Load feed once when profile and mode are ready
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Only load feed if:
    // 1. Initial loading is complete
    // 2. Profile is loaded
    // 3. Initial mode has been set (to prevent running during initial setup)
    // 4. Mode is different from what we last loaded
    if (!loading && myProfile && hasSetInitialMode && lastLoadedModeRef.current !== mode) {
      loadFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, myProfile, mode, hasSetInitialMode]);

  function moveToNextCard() {
    setCurrentIndex((prev) => prev + 1);
  }

  async function handleSwipeRight(profile, photoIndex = 0) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');
      
      console.log(`✅ Profile ${myUserId} LIKED profile ${profile?.user_id} (mode: ${mode})`);
      
      // Record the like (dating_likes or friend_likes depending on mode)
      const likeResult = await likeUser(token, profile?.user_id, mode);
      
      // Track the like on the photo that was being viewed
      if (profile?.photos && profile.photos[photoIndex]?.id) {
        await trackPhotoLike(token, profile.photos[photoIndex].id);
      }
      
      // Check if it's a match
      if (likeResult?.isMatch) {
        console.log('🎉 It\'s a match!');
        Alert.alert(
          'It\'s a Match! 🎉', 
          `You and ${profile?.display_name || 'this user'} liked each other!`
        );
      }
      
      // moveToNextCard is handled by onNext callback from SwipeDeckNew
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
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');
      
      console.log(`⏭️  Profile ${myUserId} PASSED ON profile ${profile?.user_id} (mode: ${mode})`);
      
      // Record the pass (dating_passes or friend_passes depending on mode)
      await passUser(token, profile?.user_id, mode);
      
      // Track the pass on the photo that was being viewed
      if (profile?.photos && profile.photos[photoIndex]?.id) {
        await trackPhotoPass(token, profile.photos[photoIndex].id);
      }
      
      // moveToNextCard is handled by onNext callback from SwipeDeckNew
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

  if (loading || loadingFeed) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const current = profiles[currentIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top bar (use ChatStyles to match Matches and Likes exactly) */}
      <View style={chatStyles.topBar}>
        <Pressable style={chatStyles.brandMark} hitSlop={10}>
          <Text style={chatStyles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={chatStyles.centerSlot}>
          <Text style={chatStyles.title}>Discover</Text>
        </View>

        <ModeToggleButton
          mode={mode}
          onModeChange={setMode}
          isDatingEnabled={myProfile?.is_dating_enabled ?? false}
          isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
        />
      </View>

      <View style={styles.content}>
        {current ? (
          <SwipeDeckNew
            profiles={profiles}
            currentIndex={currentIndex}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onNext={moveToNextCard}
          />
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                That&apos;s all for now!{'\n'}Check back later for new profiles.
              </Text>
              <Text style={styles.emptySub}>Six Degrees</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
