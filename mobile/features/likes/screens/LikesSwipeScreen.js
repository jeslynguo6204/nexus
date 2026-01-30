// mobile/features/likes/screens/LikesSwipeScreen.js
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

import SwipeDeck from '../../home/components/SwipeDeck';
import { likeUser, passUser } from '../../../api/swipesAPI';
import { trackPhotoLike, trackPhotoPass } from '../../../api/photosAPI';
import { getIdToken } from '../../../auth/tokens';
import { COLORS } from '../../../styles/themeNEW';

export default function LikesSwipeScreen({ navigation, route }) {
  const { profiles: initialProfiles, startIndex = 0, mode = 'romantic' } = route.params || {};
  
  const [profiles, setProfiles] = useState(initialProfiles || []);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [myUserId, setMyUserId] = useState(null);
  const swipingRef = useRef(false);

  useEffect(() => {
    // Get user ID from token
    const loadUserId = async () => {
      try {
        const token = await getIdToken();
        if (token) {
          // Decode JWT to get user ID (basic decode)
          const payload = JSON.parse(atob(token.split('.')[1]));
          setMyUserId(payload.userId);
        }
      } catch (e) {
        console.warn('Error loading user ID:', e);
      }
    };
    loadUserId();
  }, []);

  const handleSwipeRight = useCallback(async (profile) => {
    if (swipingRef.current) return;
    swipingRef.current = true;

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      // Record the like
      await likeUser(token, profile.user_id, mode);

      // Track photo engagement
      const photos = profile.photos || [];
      if (photos.length > 0 && myUserId) {
        const primaryPhotoUrl = typeof photos[0] === 'string' ? photos[0] : photos[0]?.url;
        if (primaryPhotoUrl) {
          try {
            await trackPhotoLike(token, profile.user_id, primaryPhotoUrl);
          } catch (photoErr) {
            console.warn('Error tracking photo like:', photoErr);
          }
        }
      }
    } catch (e) {
      console.warn('Error recording like:', e);
      Alert.alert('Error', 'Failed to record like');
    } finally {
      swipingRef.current = false;
    }
  }, [mode, myUserId]);

  const handleSwipeLeft = useCallback(async (profile) => {
    if (swipingRef.current) return;
    swipingRef.current = true;

    try {
      const token = await getIdToken();
      if (!token) throw new Error('Not signed in');

      // Record the pass
      await passUser(token, profile.user_id, mode);

      // Track photo engagement
      const photos = profile.photos || [];
      if (photos.length > 0 && myUserId) {
        const primaryPhotoUrl = typeof photos[0] === 'string' ? photos[0] : photos[0]?.url;
        if (primaryPhotoUrl) {
          try {
            await trackPhotoPass(token, profile.user_id, primaryPhotoUrl);
          } catch (photoErr) {
            console.warn('Error tracking photo pass:', photoErr);
          }
        }
      }
    } catch (e) {
      console.warn('Error recording pass:', e);
      Alert.alert('Error', 'Failed to record pass');
    } finally {
      swipingRef.current = false;
    }
  }, [mode, myUserId]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!profiles || profiles.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.text, fontSize: 16 }}>No profiles to show</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasMore = currentIndex < profiles.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header with back button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.surface,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontAwesome name="arrow-left" size={18} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: COLORS.text,
        }}>
          {currentIndex + 1} of {profiles.length}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Swipe deck */}
      <View style={{ flex: 1 }}>
        {hasMore ? (
          <SwipeDeck
            profiles={profiles}
            currentIndex={currentIndex}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onNext={handleNext}
          />
        ) : (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: COLORS.text,
              marginBottom: 8,
              textAlign: 'center',
            }}>
              That's everyone!
            </Text>
            <Text style={{
              fontSize: 16,
              color: COLORS.textSecondary,
              textAlign: 'center',
              marginBottom: 24,
            }}>
              You've seen all the people who liked you.
            </Text>
            <TouchableOpacity
              onPress={handleGoBack}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Back to Likes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
