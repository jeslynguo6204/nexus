import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileForm from '../components/ProfileForm';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';

export default function ProfileScreen({ onSignOut }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_BASE}/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to fetch profile');
        }
        const json = await res.json();
        setProfile(json.profile);
      } catch (e) {
        console.warn(e);
        Alert.alert('Error', String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(updatedFields) {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE}/profiles/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });
      const json = await res.json();
      if (!res.ok) return Alert.alert('Error', json.error || 'Update failed');
      setProfile(json.profile);
      Alert.alert('Saved', 'Profile updated');
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      {profile ? (
        <ProfileForm profile={profile} onSave={handleSave} />
      ) : (
        <View style={{ padding: 16 }}>
          <Text>No profile found.</Text>
        </View>
      )}

      <View style={{ padding: 16 }}>
        <Button title="Sign out" onPress={async () => { await AsyncStorage.removeItem('token'); onSignOut(); }} />
      </View>
    </View>
  );
}
