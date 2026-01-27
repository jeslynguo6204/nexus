// mobile/screens/ProfileScreen.js

/**
 * ProfileScreen allows users to view and edit their own profile information, 
 * including basic details, preferences, interests, and photos.
 * 
 * The screen fetches the user's profile and photos on mount using the `getMyProfile` 
 * and `fetchMyPhotos` API calls. It displays this data in a scrollable view with 
 * sections for each type of information.
 * 
 * Users can tap buttons to open modal forms to edit their basic profile details 
 * (`ProfileDetailsForm`) or preferences (`ProfilePreferencesForm`). They can also 
 * add or remove interests and photos directly on the screen.
 * 
 * The `PreviewModal` component is used to display a full-screen preview of the user's
 * profile as it would appear to others, using the `ProfileCard` component.
 * 
 * The screen also includes a button to sign out of the app, which removes the user's
 * token from local storage.
 * 
 * Overall, this screen uses many of the other components in the app, including:
 * - `ProfileDetailsForm` and `ProfilePreferencesForm` for editing profile data
 * - `ProfileCard` for previewing the user's profile
 * - `PreviewModal` for displaying the profile preview in a modal
 * 
 * It also makes use of several API calls to fetch and update the user's profile and 
 * photo data.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProfileDetailsForm from '../components/ProfileDetailsForm/ProfileDetailsForm';
import ProfilePreferencesForm from '../components/ProfilePreferencesForm/ProfilePreferencesForm';
import ProfileCard from '../../home/components/ProfileCard';
import PreviewModal from '../components/PreviewModal';

import { COLORS } from '../../../styles/ProfileFormStyles';
import styles from '../../../styles/ProfileScreenStyles';
import chatStyles from '../../../styles/ChatStyles';

// ✅ API helpers
import { fetchMyPhotos, addPhoto, deletePhoto, reorderPhotos } from '../../../api/photosAPI';
import { getMyProfile, updateMyProfile } from '../../../api/profileAPI';
import { getMySchoolAffiliations } from '../../../api/affiliationsAPI';

const MAX_INTERESTS = 6;

const INTEREST_OPTIONS = [
  'Coffee',
  'Study Spots',
  'Live Music',
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
  'Running',
  'Camping',
  'Baking',
  'Yoga',
  'Meditation',
  'Writing',
  'Painting',
  'Drawing',
  'Graphic Design',
  'Fashion',
  'Beauty & Skincare',
  'Podcasts',
  'Stand-up Comedy',
  'Board Games',
  'Puzzles',
  'Volunteering',
  'Activism',
  'Sustainability',
  'DIY Crafts',
  'Gardening',
  'Interior Design',
  'Architecture',
  'History',
  'Philosophy',
  'Science',
  'Technology',
  'Entrepreneurship',
  'Public Speaking',
  'Language Learning',
  'Cultural Exchanges',
  'Virtual Reality',
  'Artificial Intelligence',
  'Cryptocurrency',
  'Blockchain',
  'Investing',
  'Personal Finance',
];

export default function ProfileScreen({ onSignOut }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [prefsVisible, setPrefsVisible] = useState(false);
  const [interestVisible, setInterestVisible] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [affiliations, setAffiliations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Not signed in');
        }

        // ✅ use profile API helper
        const myProfile = await getMyProfile(token);
        console.log('ProfileScreen - myProfile data:', JSON.stringify(myProfile, null, 2));
        setProfile(myProfile);

        // ✅ Fetch affiliations to get names for IDs
        const affiliationsData = await getMySchoolAffiliations(token);
        // Flatten all affiliations from all categories
        const allAffiliations = Object.values(affiliationsData).flat();
        setAffiliations(allAffiliations);

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

  const selectedInterests =
    profile && Array.isArray(profile.interests) ? profile.interests : [];

  const normalize = (s) => (s || '').trim().toLowerCase();

  const enrichedAffiliationsInfo = useMemo(() => {
    // If backend already sent detailed affiliation objects, use them.
    if (Array.isArray(profile?.affiliations_info) && profile.affiliations_info.length > 0) {
      return profile.affiliations_info;
    }

    const ids = Array.isArray(profile?.affiliations) ? profile.affiliations : [];
    if (ids.length === 0 || affiliations.length === 0) return [];

    return ids
      .map((id) => {
        const normalizedId = typeof id === 'string' ? parseInt(id, 10) : id;
        const found = affiliations.find((aff) => {
          const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
          return affId === normalizedId;
        });
        if (!found) return null;
        return { ...found, id: typeof found.id === 'string' ? parseInt(found.id, 10) : found.id };
      })
      .filter(Boolean);
  }, [profile?.affiliations_info, profile?.affiliations, affiliations]);

  const { width: winW, height: winH } = useWindowDimensions();
  const PREVIEW_CARD_WIDTH = winW - 32;
  const PREVIEW_CARD_HEIGHT = Math.min(PREVIEW_CARD_WIDTH * 1.6, winH * 0.55);
  const PHOTO_GAP = 8;
  const scrollPaddingH = 20;
  const safeH = (insets?.left ?? 0) + (insets?.right ?? 0);
  const photoAreaWidth = winW - safeH - scrollPaddingH;
  const photoSize = Math.floor((photoAreaWidth - 2 * PHOTO_GAP - 42) / 3);

  // Shape own profile for ProfileCard (same format as discover feed cards)
  const previewProfile = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile,
      id: profile.user_id,
      affiliations_info: enrichedAffiliationsInfo,
      // school already from API; ensure school_short_name for card subtitle
      school_short_name: profile.school?.short_name ?? profile.school_short_name,
      school_name: profile.school?.name ?? profile.school_name,
    };
  }, [profile, enrichedAffiliationsInfo]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

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

  async function handlePhotoReorder(data, from, to) {
    const next = data.filter((item) => !item.isAdd);

    const unchanged =
      next.length === photos.length &&
      next.every((p, idx) => photos[idx]?.id === p.id);

    if (from === to || next.length !== photos.length || unchanged) {
      setPhotoBusy(false);
      return;
    }

    const previous = photos;
    setPhotos(next);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');

      await reorderPhotos(
        token,
        next.map((p) => p.id)
      );
    } catch (e) {
      console.warn(e);
      setPhotos(previous);
      Alert.alert('Error', String(e.message || e));
    } finally {
      setPhotoBusy(false);
    }
  }

  const primaryPhotoUrl = photos[0]?.url;
  const photoListData =
    photos.length < 6 ? [...photos, { id: 'add-tile', isAdd: true }] : photos;

  const renderPhotoItem = ({ item, drag, isActive }) => {
    const slotStyle = [styles.photoSlot, { width: photoSize, height: photoSize }];
    if (item.isAdd) {
      return (
        <TouchableOpacity
          style={[...slotStyle, styles.addPhotoSlot]}
          onPress={pickPhoto}
          disabled={photoBusy}
        >
          <Text style={styles.photoPlaceholder}>+</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[...slotStyle, isActive && styles.photoSlotActive]}
        onLongPress={drag}
        delayLongPress={120}
        onPress={() => removePhoto(item.id)}
        disabled={photoBusy}
      >
        <Image source={{ uri: item.url }} style={styles.photoImage} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={chatStyles.container} edges={['top', 'left', 'right']}>
      {/* Top bar matching Matches/Chat exactly */}
      <View style={chatStyles.topBar}>
        <Pressable style={chatStyles.brandMark} hitSlop={10}>
          <Text style={chatStyles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={chatStyles.centerSlot}>
          <Text style={chatStyles.title}>Profile</Text>
        </View>

        <View style={chatStyles.rightSlot}>
          <TouchableOpacity
            onPress={() => setPrefsVisible(true)}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesome name="cog" size={22} color="#111111" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                    {(() => {
                      const schoolShortName = profile?.school?.short_name || profile?.school?.name || '';
                      const gradYearShort = profile.graduation_year ? `'${String(profile.graduation_year).slice(-2)}` : '';
                      const schoolAndYear = schoolShortName && gradYearShort 
                        ? `${schoolShortName} ${gradYearShort}` 
                        : schoolShortName || gradYearShort;
                      
                      // Get featured affiliations (up to 2)
                      // Only show featured affiliations if they are explicitly selected
                      // If empty or not set, don't show any (no fallback to regular affiliations)
                      const featuredAffiliationIds = profile?.featured_affiliations || [];
                      let featuredAffiliationNames = [];
                      
                      if (Array.isArray(featuredAffiliationIds) && featuredAffiliationIds.length > 0 && affiliations.length > 0) {
                        featuredAffiliationNames = featuredAffiliationIds
                          .slice(0, 2)
                          .map((featuredId) => {
                            const normalizedFeatured = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
                            const found = affiliations.find((aff) => {
                              const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
                              return affId === normalizedFeatured;
                            });
                            return found ? (found.short_name || found.name) : null;
                          })
                          .filter(Boolean);
                      }
                      
                      const parts = [schoolAndYear, ...featuredAffiliationNames].filter(Boolean);
                      return parts.join(' · ');
                    })()}
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

            <DraggableFlatList
              data={photoListData}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderPhotoItem}
              numColumns={3}
              scrollEnabled={false}
              activationDistance={12}
              contentContainerStyle={styles.photoGrid}
              columnWrapperStyle={[styles.photoRow, { gap: PHOTO_GAP }]}
              onDragBegin={() => setPhotoBusy(true)}
              onDragEnd={({ data, from, to }) => handlePhotoReorder(data, from, to)}
            />

            <Text style={styles.metaText}>
              Long press to drag and reorder. Tap a photo to remove it. Tap + to add up to 6 photos. First photo becomes your avatar.
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
          {profile && (
            <ProfileDetailsForm
              profile={profile}
              primaryPhotoUrl={photos[0]?.url}
              onEditPhoto={pickPhoto}
              photoBusy={photoBusy}
              onSave={async (payload) => {
                await handleSave(payload);
                setEditVisible(false);
              }}
              onClose={() => setEditVisible(false)}
            />
          )}
      </Modal>

      <Modal visible={prefsVisible} animationType="slide">
          {profile && (
            <ProfilePreferencesForm
              profile={profile}
              onSave={async (payload) => {
                await handleSave(payload);
                setPrefsVisible(false);
              }}
              onClose={() => setPrefsVisible(false)}
              onLogOut={async () => {
                setPrefsVisible(false);
                await AsyncStorage.removeItem('token');
                onSignOut();
              }}
            />
          )}
      </Modal>

      <Modal visible={interestVisible} animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: '#F3F7FC',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
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
        </View>
      </Modal>

      <PreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
      >
        {previewProfile && (
          <View style={[styles.previewCardWrap, { width: PREVIEW_CARD_WIDTH, height: PREVIEW_CARD_HEIGHT }]}>
            <ProfileCard
              profile={previewProfile}
              photos={photos}
              isOwnProfile
            />
          </View>
        )}
      </PreviewModal>
    </SafeAreaView>
  );
}