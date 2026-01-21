// mobile/features/likes/screens/LikesScreen.js
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

import ModeToggleButton from '../../../navigation/ModeToggleButton';
import { getMyProfile } from '../../../api/profileAPI';

import likesStyles from '../../../styles/LikesStyles';
import chatStyles from '../../../styles/ChatStyles'; // ✅ add this

export default function LikesScreen() {
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [mode, setMode] = useState('romantic');
  const hasSetInitialMode = useRef(false);

  const loadProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      const profile = await getMyProfile(token);
      setMyProfile(profile);
    } catch (e) {
      console.warn('Error loading profile:', e);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  if (loading) {
    return (
      <SafeAreaView style={likesStyles.container} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={likesStyles.container} edges={['top', 'left', 'right']}>
      {/* Top bar (use ChatStyles so it matches Matches exactly) */}
      <View style={chatStyles.topBar}>
        <Pressable style={chatStyles.brandMark} hitSlop={10}>
          <Text style={chatStyles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={chatStyles.centerSlot}>
          <Text style={chatStyles.title}>Likes</Text>
        </View>

        <ModeToggleButton
          mode={mode}
          onModeChange={setMode}
          isDatingEnabled={myProfile?.is_dating_enabled ?? false}
          isFriendsEnabled={myProfile?.is_friends_enabled ?? false}
        />
      </View>

      <View style={likesStyles.content}>
        <Text style={likesStyles.placeholderText}>Likes screen coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
