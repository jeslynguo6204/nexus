// mobile/components/SwipeDeck.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileCard from './ProfileCard';

const API_BASE = 'http://localhost:4000'; // or your IP

export default function SwipeDeck() {
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadProfiles() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${API_BASE}/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        console.warn(json);
        return;
      }

      setProfiles(json.profiles || []);
      setIndex(0);
    } catch (e) {
      console.warn('Failed to load feed', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  if (profiles.length === 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text>No more profiles.</Text>
        <TouchableOpacity onPress={loadProfiles}>
          <Text style={{ color: 'blue', marginTop: 12 }}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = profiles[index];

  return (
    <View>
      <ProfileCard profile={current} />

      {/* temporary next button for testing */}
      <TouchableOpacity
        style={{ marginTop: 20, alignSelf: 'center' }}
        onPress={() => {
          if (index < profiles.length - 1) {
            setIndex(index + 1);
          } else {
            setProfiles([]);
          }
        }}
      >
        <Text style={{ color: 'blue' }}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
