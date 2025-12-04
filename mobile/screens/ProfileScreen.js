// mobile/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ProfileDetailsForm from '../components/ProfileDetailsForm';
import ProfilePreferencesForm from '../components/ProfilePreferencesForm';
import { COLORS } from '../styles/ProfileFormStyles';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';
const MAX_INTERESTS = 6;
const INTEREST_OPTIONS = [
  'Coffee',
  'Morning Runs',
  'Study Spots',
  'Live Music',
  'Tech & HCI',
  'Boba',
  'Sports',
  'Movies',
  'Reading',
  'Cooking',
  'Hiking',
  'Gaming',
  'Photography',
  'Traveling',
  'Fitness',
];

export default function ProfileScreen({ onSignOut }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [prefsVisible, setPrefsVisible] = useState(false);
  const [interestVisible, setInterestVisible] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_BASE}/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch profile');
        }
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
      if (!('interests' in updatedFields)) {
        Alert.alert('Saved', 'Profile updated');
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const selectedInterests =
    profile && Array.isArray(profile.interests) ? profile.interests : [];
  const photos = profile && Array.isArray(profile.photos) ? profile.photos.filter(Boolean) : [];

  const normalize = (s) => (s || '').trim().toLowerCase();

  const availableInterests = INTEREST_OPTIONS.filter(
    (opt) => !selectedInterests.some((sel) => normalize(sel) === normalize(opt))
  );

  async function addInterest(interest) {
    if (selectedInterests.length >= MAX_INTERESTS) {
      Alert.alert('Limit reached', `You can pick up to ${MAX_INTERESTS} interests.`);
      return;
    }
    if (selectedInterests.some((i) => normalize(i) === normalize(interest))) {
      setInterestVisible(false);
      return;
    }
    await handleSave({ interests: [...selectedInterests, interest] });
    setInterestVisible(false);
  }

  async function removeInterest(interest) {
    const next = selectedInterests.filter(
      (i) => normalize(i) !== normalize(interest)
    );
    await handleSave({ interests: next });
  }

  async function pickPhoto(slotIndex) {
    if (photoBusy) return;
    try {
      setPhotoBusy(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to select images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;
      const asset = result.assets && result.assets[0];
      if (!asset) return;
      const dataUri = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      const next = [...photos];
      next[slotIndex] = dataUri;
      const trimmed = next.slice(0, 6);
      await handleSave({ photos: trimmed });
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto(slotIndex) {
    if (photoBusy) return;
    const next = photos.filter((_, i) => i !== slotIndex);
    await handleSave({ photos: next });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F7FC' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My Profile</Text>
          </View>
          <TouchableOpacity
            onPress={() => setPrefsVisible(true)}
            style={styles.iconButton}
          >
            <FontAwesome name="cog" size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>

          {profile ? (
            <>
              <View style={styles.profileRow}>
                {photos[0] ? (
                  <Image source={{ uri: photos[0] }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>
                    {profile.display_name || 'Add your name'}
                  </Text>
                  <Text style={styles.metaText}>
                    {profile.major || 'Major TBD'}
                    {profile.graduation_year ? ` · '${String(profile.graduation_year).slice(-2)}` : ''}
                  </Text>
                </View>
              </View>

              <Text style={[styles.metaText, { marginTop: 8 }]}>
                {profile.bio ? profile.bio : 'Add a short bio'}
              </Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => setEditVisible(true)}
                >
                  <Text style={styles.primaryButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1, marginLeft: 8 }]}
                  onPress={() => {}}
                >
                  <Text style={styles.secondaryButtonText}>Share Profile</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.metaText}>No profile found.</Text>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionHeader}>My Interests</Text>
          <Text style={styles.metaText}>Add interests to show more about you.</Text>
          <View style={styles.chipRow}>
            {selectedInterests.length === 0 ? (
              <Text style={styles.metaText}>No interests yet.</Text>
            ) : (
              selectedInterests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={styles.chip}
                  onPress={() => removeInterest(interest)}
                >
                  <Text style={styles.chipText}>{interest}</Text>
                </TouchableOpacity>
              ))
            )}
            {selectedInterests.length < MAX_INTERESTS && (
              <TouchableOpacity
                style={[styles.chip, styles.addChip]}
                onPress={() => setInterestVisible(true)}
              >
                <Text style={[styles.chipText, { color: COLORS.primary }]}>
                  + Add interest
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.metaText}>
            Up to {MAX_INTERESTS} interests. Tap an interest to remove it.
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionHeader}>My Photos</Text>
          <Text style={styles.metaText}>Show who you are with a few photos.</Text>
          <View style={styles.photoGrid}>
            {Array.from({ length: 6 }).map((_, idx) => {
              const uri = photos[idx];
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.photoSlot}
                  onPress={() => pickPhoto(idx)}
                  onLongPress={() => uri && removePhoto(idx)}
                  disabled={photoBusy}
                >
                  {uri ? (
                    <Image source={{ uri }} style={styles.photoImage} />
                  ) : (
                    <Text style={styles.photoPlaceholder}>+</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.metaText}>
            Tap a slot to add/replace. Long press to remove. First photo becomes your avatar.
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Button
            title="Sign out"
            onPress={async () => {
              await AsyncStorage.removeItem('token');
              onSignOut();
            }}
          />
        </View>
      </ScrollView>

      <Modal visible={editVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          {profile && (
            <ProfileDetailsForm
              profile={profile}
              onSave={async (payload) => {
                await handleSave(payload);
                setEditVisible(false);
              }}
              onClose={() => setEditVisible(false)}
            />
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={prefsVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          {profile && (
            <ProfilePreferencesForm
              profile={profile}
              onSave={async (payload) => {
                await handleSave(payload);
                setPrefsVisible(false);
              }}
              onClose={() => setPrefsVisible(false)}
            />
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={interestVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ padding: 16, flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Add Interest</Text>
              <TouchableOpacity
                onPress={() => setInterestVisible(false)}
                style={styles.iconButton}
              >
                <FontAwesome name="close" size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
              {availableInterests.length === 0 ? (
                <Text style={styles.metaText}>All interests selected.</Text>
              ) : (
                <View style={styles.chipRowWrap}>
                  {availableInterests.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.chip}
                      onPress={() => addInterest(opt)}
                    >
                      <Text style={styles.chipText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E1E8F5',
    marginRight: 12,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    alignItems: 'center',
    gap: 8,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  addChip: {
    borderColor: COLORS.primary,
    backgroundColor: '#E9F4FF',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  photoSlot: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#E8EDF6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    fontSize: 32,
    color: '#9CA3AF',
    fontWeight: '700',
  },
};
