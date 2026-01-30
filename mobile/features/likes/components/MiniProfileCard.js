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

function getFirstName(displayName) {
  const name = (displayName || '').trim();
  if (!name) return '';
  return name.split(/\s+/)[0];
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
  const displayName = profile?.display_name || profile?.name || 'Unknown';
  const firstName = getFirstName(displayName) || displayName;

  // Get featured affiliations in the order they were selected (preserve order from backend)
  const affiliationsInfo = profile?.affiliations_info || [];
  const featuredAffiliationIds = profile?.featured_affiliations || profile?.featuredAffiliations || [];
  
  // Filter out dorms
  const allNonDormAffiliations = affiliationsInfo.filter((aff) => !aff.is_dorm);
  
  // Get featured affiliation IDs in order (normalized)
  const featuredIds = (featuredAffiliationIds || [])
    .slice(0, 2)
    .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
    .filter(id => !isNaN(id) && id > 0);
  
  // Create a map of all affiliations by ID for quick lookup
  const affMap = new Map();
  allNonDormAffiliations.forEach(aff => {
    const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
    affMap.set(affId, aff);
  });
  
  // Get featured affiliations in selection order
  const featuredAffiliations = featuredIds
    .map(id => affMap.get(id))
    .filter(Boolean)
    .map(aff => aff.short_name || aff.name)
    .filter(Boolean);

  const affiliationLine = featuredAffiliations.join(' · ');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Photo */}
      {primaryPhoto ? (
        <Image source={{ uri: primaryPhoto }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>No Photo</Text>
        </View>
      )}

      {/* Info overlay at bottom */}
      <View style={styles.infoOverlay}>
        <Text style={styles.nameRow} numberOfLines={1}>
          <Text style={styles.firstName}>{firstName}</Text>
          {age != null && <Text style={styles.age}>, {age}</Text>}
        </Text>
        {affiliationLine ? (
          <Text style={styles.affiliationText} numberOfLines={1}>
            {affiliationLine}
          </Text>
        ) : null}
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
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  nameRow: {
    marginBottom: 1,
  },
  firstName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  age: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  affiliationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});