// mobile/components/ProfileDetailsForm.js

/**
 * ProfileDetailsForm is a reusable form component for editing a user's basic profile 
 * information, such as their display name, bio, major, and graduation year.
 * 
 * It is used within the ProfileScreen to allow users to edit their own profile 
 * details. When the form is submitted, it calls the onSave prop with the updated
 * profile fields, which the ProfileScreen handles by making an API call to update 
 * the user's profile on the server.
 * 
 * The form is pre-populated with the user's current profile details, which are 
 * passed in as the profile prop. It uses reusable input components and styles from 
 * the ProfileFormStyles module to maintain a consistent look and feel with other 
 * forms in the app.
 * 
 * Overall, this component plays a crucial role in allowing users to personalize 
 * their profiles, which are a central part of the app's functionality and user 
 * experience.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../styles/themeNEW';

// Optional location import - gracefully handle if not installed
let Location = null;
try {
  Location = require('expo-location');
} catch (e) {
  // expo-location not installed, location features will be disabled
}

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const ACADEMIC_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

export default function ProfileDetailsForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [major, setMajor] = useState(profile.major || '');
  const [graduationYear, setGraduationYear] = useState(
    profile.graduation_year ? String(profile.graduation_year) : ''
  );
  const [academicYear, setAcademicYear] = useState(profile.academic_year || null);
  const [locationDescription, setLocationDescription] = useState(profile.location_description || '');
  const [locationLat, setLocationLat] = useState(profile.location_lat || '');
  const [locationLon, setLocationLon] = useState(profile.location_lon || '');
  const [showMeInDiscovery, setShowMeInDiscovery] = useState(
    profile.show_me_in_discovery ?? true
  );
  const [affiliations, setAffiliations] = useState(
    profile.affiliations && Array.isArray(profile.affiliations) ? profile.affiliations : []
  );
  const [locationLoading, setLocationLoading] = useState(false);

  const schoolLabel =
    profile?.school?.name ||
    profile?.school_name ||
    profile?.school?.short_name ||
    'School not set';

  async function getCurrentLocation() {
    if (!Location) {
      Alert.alert(
        'Location unavailable',
        'Location services are not available. Please install expo-location or enter coordinates manually.'
      );
      return;
    }

    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required to use your current location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocationLat(String(location.coords.latitude));
      setLocationLon(String(location.coords.longitude));
      
      // Optionally reverse geocode to get a description
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (address) {
          const desc = [address.street, address.city, address.region]
            .filter(Boolean)
            .join(', ');
          if (desc) setLocationDescription(desc);
        }
      } catch (e) {
        // Geocoding failed, that's okay
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get your location. Please enter it manually.');
      console.warn('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  }

  function toggleAffiliation(affiliationId) {
    setAffiliations((prev) => {
      if (prev.includes(affiliationId)) {
        return prev.filter((id) => id !== affiliationId);
      } else {
        return [...prev, affiliationId];
      }
    });
  }

  function submit() {
    const gradYearNum = graduationYear ? Number(graduationYear) : null;
    const nextBio = bio.trim() === '' ? null : bio.trim();
    const nextMajor = major.trim() === '' ? null : major.trim();
    const nextDisplayName = displayName.trim() === '' ? null : displayName.trim();
    const nextLocationDesc = locationDescription.trim() === '' ? null : locationDescription.trim();
    const nextLocationLat = locationLat.trim() === '' ? null : locationLat.trim();
    const nextLocationLon = locationLon.trim() === '' ? null : locationLon.trim();
    
    onSave({
      displayName: nextDisplayName,
      bio: nextBio,
      major: nextMajor,
      graduationYear: gradYearNum,
      academicYear: academicYear || null,
      locationDescription: nextLocationDesc,
      locationLat: nextLocationLat,
      locationLon: nextLocationLon,
      showMeInDiscovery: showMeInDiscovery,
      affiliations: affiliations.length > 0 ? affiliations : null,
    });
  }

  return (
    <View style={[localStyles.container, { paddingTop: insets.top }]}>
      {/* Minimal header */}
      <View style={localStyles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={localStyles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="times" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={submit}
          style={localStyles.saveButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={localStyles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Display Name */}
        <View style={[localStyles.section, { marginTop: 24 }]}>
          <Text style={localStyles.label}>Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            style={localStyles.input}
            placeholder="What should people see?"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Bio */}
        <View style={localStyles.section}>
          <Text style={localStyles.label}>About</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            style={[localStyles.input, localStyles.textArea]}
            placeholder="Say something about yourself"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Major */}
        <View style={localStyles.section}>
          <Text style={localStyles.label}>Major</Text>
          <TextInput
            value={major}
            onChangeText={setMajor}
            style={localStyles.input}
            placeholder="e.g. Computer Science"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* School */}
        <View style={localStyles.section}>
          <Text style={localStyles.label}>School</Text>
          <View style={localStyles.readonlyField}>
            <Text style={localStyles.readonlyText}>{schoolLabel}</Text>
          </View>
        </View>

        {/* Graduation Year */}
        <View style={localStyles.section}>
          <Text style={localStyles.label}>Graduation year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={localStyles.chipRow}
            contentContainerStyle={localStyles.chipRowContent}
          >
            {GRAD_YEARS.map((year) => {
              const selected = graduationYear === String(year);
              return (
                <TouchableOpacity
                  key={year}
                  onPress={() => setGraduationYear(String(year))}
                  style={[localStyles.chip, selected && localStyles.chipSelected]}
                >
                  <Text
                    style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Academic Year */}
        <View style={localStyles.section}>
          <Text style={localStyles.label}>Academic year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={localStyles.chipRow}
            contentContainerStyle={localStyles.chipRowContent}
          >
            {ACADEMIC_YEARS.map((year) => {
              const selected = academicYear === year;
              return (
                <TouchableOpacity
                  key={year}
                  onPress={() => setAcademicYear(year)}
                  style={[localStyles.chip, selected && localStyles.chipSelected]}
                >
                  <Text
                    style={selected ? localStyles.chipTextSelected : localStyles.chipText}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Location */}
        <View style={localStyles.section}>
          <Text style={localStyles.label}>Location</Text>
          <TextInput
            value={locationDescription}
            onChangeText={setLocationDescription}
            style={localStyles.input}
            placeholder="e.g. New York, NY or On campus"
            placeholderTextColor={COLORS.textMuted}
          />
          {Location && (
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={locationLoading}
              style={localStyles.locationButton}
            >
              <Text style={localStyles.locationButtonText}>
                {locationLoading ? 'Getting location...' : 'Use current location'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Discovery */}
        <View style={localStyles.section}>
          <View style={localStyles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={localStyles.switchLabel}>Show me in discovery</Text>
              <Text style={localStyles.switchSubtext}>
                Allow others to see your profile
              </Text>
            </View>
            <Switch
              value={showMeInDiscovery}
              onValueChange={setShowMeInDiscovery}
              trackColor={{ false: COLORS.divider, true: COLORS.accentSoft }}
              thumbColor={showMeInDiscovery ? COLORS.accent : COLORS.surface}
            />
          </View>
        </View>

        {/* Affiliations */}
        {profile.affiliations && profile.affiliations.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.label}>Affiliations</Text>
            <Text style={localStyles.affiliationText}>
              {affiliations.length} selected
            </Text>
            <Text style={localStyles.affiliationSubtext}>
              Affiliation management coming soon
            </Text>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface, // White background like VSCO
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
  },
  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginTop: 30, // Large spacing between sections (VSCO style)
  },
  label: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginBottom: 10,
    letterSpacing: 0,
  },
  input: {
    backgroundColor: COLORS.backgroundSubtle, // Light gray rounded container
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 0, // No border
    fontWeight: '400',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  readonlyField: {
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readonlyText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  chipRow: {
    marginTop: 4,
  },
  chipRowContent: {
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: COLORS.backgroundSubtle,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.textPrimary,
  },
  chipText: {
    fontSize: 15,
    color: COLORS.textBody,
    fontWeight: '400',
  },
  chipTextSelected: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.surface,
  },
  locationButton: {
    marginTop: 10,
    paddingVertical: 4,
  },
  locationButtonText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    lineHeight: 18,
  },
  affiliationText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '400',
    marginTop: 4,
  },
  affiliationSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
});
