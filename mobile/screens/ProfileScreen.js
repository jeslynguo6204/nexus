// mobile/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileDetailsForm from '../components/ProfileDetailsForm';
import ProfilePreferencesForm from '../components/ProfilePreferencesForm';
import ProfileCard from '../components/ProfileCard';
import PreviewModal from '../components/PreviewModal';

import { COLORS } from '../styles/ProfileFormStyles';
import styles from '../styles/ProfileScreenStyles';

// ✅ API helpers
import { fetchMyPhotos, addPhoto, deletePhoto } from '../api/photosAPI';
import { getMyProfile, updateMyProfile } from '../api/profileAPI';

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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [prefsVisible, setPrefsVisible] = useState(false);
  const [interestVisible, setInterestVisible] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Not signed in');
        }

        // ✅ use profile API helper
        const myProfile = await getMyProfile(token);
        setProfile(myProfile);

        // ✅ use photos API helper
        const photoRows = await fetchMyPhotos(token);
        setPhotos(photoRows);
      } catch (e) {
        console.warn(e);
        Alert.alert('Error', String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(updatedFields) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      const updatedProfile = await updateMyProfile(token, updatedFields);
      setProfile(updatedProfile);

      // keep quiet for interests-only updates
      if (!('interests' in updatedFields)) {
        Alert.alert('Saved', 'Profile updated');
      }
    } catch (e) {
      Alert.alert('Error', String(e.message || e));
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const selectedInterests =
    profile && Array.isArray(profile.interests) ? profile.interests : [];

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

  // ---- PHOTO LOGIC USING /photos API ----

  async function pickPhoto() {
    if (photoBusy) return;
    try {
      setPhotoBusy(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
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

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      if (photos.length >= 6) {
        Alert.alert('Limit reached', 'You can upload up to 6 photos.');
        return;
      }

      const created = await addPhoto(token, dataUri);
      setPhotos((prev) => [...prev, created]);
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', String(e.message || e));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto(photoId) {
    if (photoBusy) return;
    try {
      setPhotoBusy(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      await deletePhoto(token, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', String(e.message || e));
    } finally {
      setPhotoBusy(false);
    }
  }

  const primaryPhotoUrl = photos[0]?.url;

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
                {primaryPhotoUrl ? (
                  <Image source={{ uri: primaryPhotoUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>
                    {profile.display_name || 'Add your name'}
                  </Text>
                  <Text style={styles.metaText}>
                    {(profile?.school?.short_name || profile?.school?.name || '') &&
                      `${profile?.school?.short_name || profile?.school?.name}`}
                    {profile.graduation_year
                      ? ` '${String(profile.graduation_year).slice(-2)}`
                      : ''}
                    {profile.major ? ` · ${profile.major}` : ''}
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
                  onPress={() => setPreviewVisible(true)}
                >
                  <Text style={styles.secondaryButtonText}>Preview Profile</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.metaText}>No profile found.</Text>
          )}
        </View>

        {/* Interests */}
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

        {/* Photos */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionHeader}>My Photos</Text>
          <Text style={styles.metaText}>Show who you are with a few photos.</Text>

          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoSlot}
                onLongPress={() => removePhoto(photo.id)}
                disabled={photoBusy}
              >
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
              </TouchableOpacity>
            ))}

            {photos.length < 6 && (
              <TouchableOpacity
                style={styles.photoSlot}
                onPress={pickPhoto}
                disabled={photoBusy}
              >
                <Text style={styles.photoPlaceholder}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.metaText}>
            Tap + to add photos (up to 6). First photo becomes your avatar. Long press a photo to remove it.
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

      {/* Modals */}
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

      <PreviewModal
        visible={previewVisible}
        title="Profile preview"
        onClose={() => setPreviewVisible(false)}
      >
        <ProfileCard profile={profile} photos={photos} />
      </PreviewModal>
    </SafeAreaView>
  );
}
