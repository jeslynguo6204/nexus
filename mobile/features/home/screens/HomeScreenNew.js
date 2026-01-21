// mobile/screens/HomeScreenNew.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SwipeDeckNew from '../components/SwipeDeckNew';
import { getFeedProfiles } from '../../../api/feedAPI';
import { getMyProfile } from '../../../api/profileAPI';
import { trackPhotoLike, trackPhotoPass } from '../../../api/photosAPI';
import { likeUser, passUser } from '../../../api/swipesAPI';
import ScopeModeSelector from '../../../navigation/ScopeModeSelector';
import styles from '../../../styles/HomeStylesNew';

export default function HomeScreenNew() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myUserId, setMyUserId] = useState(null);

  const [scope, setScope] = useState('school'); // school | league | area
  const [mode, setMode] = useState('romantic'); // romantic | platonic

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not signed in');

        // Fetch both my profile and feed profiles
        const [myProfile, fetchedProfiles] = await Promise.all([
          getMyProfile(token),
          getFeedProfiles(token)
        ]);
        
        setMyUserId(myProfile?.user_id);
        setProfiles(Array.isArray(fetchedProfiles) ? fetchedProfiles : []);
        setCurrentIndex(0);
      } catch (e) {
        console.warn(e);
        Alert.alert('Error', String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function moveToNextCard() {
    setCurrentIndex((prev) => prev + 1);
  }

  async function handleSwipeRight(profile, photoIndex = 0) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');
      
      console.log(`✅ Profile ${myUserId} LIKED profile ${profile?.user_id}`);
      
      // Record the like in dating_likes table
      const likeResult = await likeUser(token, profile?.user_id);
      
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
      
      console.log(`⏭️  Profile ${myUserId} PASSED ON profile ${profile?.user_id}`);
      
      // Record the pass in dating_passes table
      await passUser(token, profile?.user_id);
      
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const current = profiles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.brandMark} hitSlop={10}>
          <Text style={styles.brandMarkText}>6°</Text>
        </Pressable>

        <ScopeModeSelector
          scope={scope}
          mode={mode}
          onScopeChange={setScope}
          onModeChange={setMode}
          scopeLabels={{
            school: 'Penn',
            league: 'Ivy League',
            area: 'Philadelphia',
          }}
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
