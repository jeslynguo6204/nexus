// mobile/components/ProfileCard.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/ProfileFormStyles';

export default function ProfileCard({ profile, photos }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const safePhotos = Array.isArray(photos) ? photos : [];
  const hasPhotos = safePhotos.length > 0;

  const current = hasPhotos ? safePhotos[photoIndex] : null;
  const currentUri = current
    ? typeof current === 'string'
      ? current
      : current.url
    : null;

  const interests =
    profile && Array.isArray(profile.interests)
      ? profile.interests.slice(0, 6)
      : [];

  function handleNextPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev + 1) % safePhotos.length);
  }

  function handlePrevPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  }

  return (
    <View style={styles.card}>
      {/* Photo area */}
      <View style={styles.photoContainer}>
        {currentUri ? (
          <Image source={{ uri: currentUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Add a photo</Text>
          </View>
        )}

        {/* LEFT TAP ZONE (previous) */}
        <TouchableOpacity
          style={styles.leftTapZone}
          onPress={handlePrevPhoto}
          activeOpacity={0.3}
        />

        {/* RIGHT TAP ZONE (next) */}
        <TouchableOpacity
          style={styles.rightTapZone}
          onPress={handleNextPhoto}
          activeOpacity={0.3}
        />

        {/* Gradient overlay with name / dots */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
          pointerEvents="none" // let taps go through to tap zones
        >
          {/* <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>
                {profile?.display_name || 'Your name'}
              </Text>
              <Text style={styles.metaText}>
                {profile?.major || 'Major TBD'}
                {profile?.graduation_year
                  ? ` · '${String(profile.graduation_year).slice(-2)}`
                  : ''}
              </Text>
            </View> */}
            <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText}>
                {profile?.display_name || 'Your name'}
              </Text>
              <Text style={styles.metaText}>
                {(profile?.school?.short_name || profile?.school?.name || '') &&
                  `${profile?.school?.short_name || profile?.school?.name}`}
                {profile?.graduation_year
                  ? ` '${String(profile.graduation_year).slice(-2)}`
                  : ''}
                {profile?.major ? ` · ${profile.major}` : ''}
              </Text>
            </View>

            {hasPhotos && (
              <View style={styles.photoDots}>
                {safePhotos.map((p, idx) => (
                  <View
                    key={p.id || idx}
                    style={[
                      styles.dot,
                      idx === photoIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Bio + interests */}
      <View style={styles.content}>
        <Text style={styles.bioText}>
          {profile?.bio || 'Add a short bio to tell people about yourself.'}
        </Text>

        {interests.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionLabel}>Interests</Text>
            <View style={styles.chipRow}>
              {interests.map((interest) => (
                <View key={interest} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  photoContainer: {
    width: '100%',
    height: 500,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  metaText: {
    color: '#E5E7EB',
    fontSize: 14,
    marginTop: 2,
  },
  photoDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginLeft: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#4B5563',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
});
