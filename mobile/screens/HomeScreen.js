// mobile/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SwipeDeck from '../components/SwipeDeck';
import { getFeedProfiles } from '../api/feedAPI';
import styles from '../styles/HomeStyles';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Not signed in');
        }

        // Fetch feed profiles from backend
        const fetchedProfiles = await getFeedProfiles(token);
        setProfiles(fetchedProfiles);
      } catch (e) {
        console.warn(e);
        Alert.alert('Error', String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSwipeRight(profile) {
    // Like or match action
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      // TODO: POST /swipes with userId and likedUserId
      // const res = await fetch(`${API_BASE}/swipes`, {
      //   method: 'POST',
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ likedUserId: profile.id, direction: 'right' }),
      // });
      // if (!res.ok) throw new Error('Failed to record swipe');

      console.log('Liked profile:', profile.user_id);
      moveToNextCard();
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', String(e.message || e));
    }
  }

  async function handleSwipeLeft(profile) {
    // Pass action
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      // TODO: POST /swipes with direction: 'left'
      console.log('Passed on profile:', profile.user_id);
      moveToNextCard();
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', String(e.message || e));
    }
  }

  function moveToNextCard() {
    setCurrentIndex((prev) => prev + 1);
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoDot}>
            <Text style={styles.logoDotText}>6°</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Find connections</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {current ? (
          <SwipeDeck
            profile={current}
            photos={current.photos || []}
            onSwipeRight={() => handleSwipeRight(current)}
            onSwipeLeft={() => handleSwipeLeft(current)}
            onNext={moveToNextCard}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#999' }}>No more profiles</Text>
          </View>
        )}
      </View>

      {/* Action buttons (X and Check) */}
      {current && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSwipeLeft(current)}
          >
            <Text style={styles.actionButtonText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSwipeRight(current)}
          >
            <Text style={styles.actionButtonText}>✓</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
