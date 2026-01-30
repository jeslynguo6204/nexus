// mobile/features/likes/components/MiniProfileCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../../styles/themeNEW';

function getAge(profile) {
  if (typeof profile?.age === 'number' && profile.age > 0) return profile.age;
  if (typeof profile?.age === 'string' && profile.age.trim()) {
    const ageNum = parseInt(profile.age.trim(), 10);
    if (!isNaN(ageNum) && ageNum > 0) return ageNum;
  }
  if (profile?.date_of_birth) {
    try {
      const birthDate = new Date(profile.date_of_birth);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age > 0 && age < 150) return age;
      }
    } catch (e) {
      // Ignore
    }
  }
  return null;
}

function normalizePhotos(photos) {
  if (!photos) return [];
  if (Array.isArray(photos)) {
    return photos
      .map((p) => {
        if (!p) return null;
        if (typeof p === 'string') return p;
        if (typeof p === 'object' && p.url) return p.url;
        return null;
      })
      .filter(Boolean);
  }
  return [];
}

export default function MiniProfileCard({ profile, onPress }) {
  const photos = normalizePhotos(profile?.photos);
  const primaryPhoto = photos[0] || null;
  const age = getAge(profile);
  const displayName = profile?.display_name || 'Unknown';
  const school = profile?.school_short_name || profile?.school_name || '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Photo */}
      <View style={styles.photoContainer}>
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No Photo</Text>
          </View>
        )}
      </View>

      {/* Info overlay at bottom */}
      <View style={styles.infoOverlay}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.metaRow}>
          {age && <Text style={styles.metaText}>{age}</Text>}
          {age && school && <Text style={styles.metaSeparator}> · </Text>}
          {school && <Text style={styles.metaText} numberOfLines={1}>{school}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.75, // 3:4 ratio
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  photoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSubtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSubtle,
  },
  photoPlaceholderText: {
    color: COLORS.textDisabled,
    fontSize: 12,
    fontWeight: '600',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
  metaSeparator: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
