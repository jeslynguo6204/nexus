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
import { View, Text, TextInput, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import styles, { COLORS } from '../styles/ProfileFormStyles';

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
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, styles.firstSectionTitle]}>
          Edit profile
        </Text>

        <Text style={styles.label}>Display name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          placeholder="What should people see?"
          placeholderTextColor={COLORS.muted}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          style={[styles.input, styles.textArea]}
          placeholder="Say something about yourself"
          placeholderTextColor={COLORS.muted}
        />

        <Text style={styles.label}>Major</Text>
        <TextInput
          value={major}
          onChangeText={setMajor}
          style={styles.input}
          placeholder="e.g. Computer Science"
          placeholderTextColor={COLORS.muted}
        />

        <Text style={styles.label}>School</Text>
        <View style={styles.readonlyField}>
          <Text style={styles.readonlyText}>{schoolLabel}</Text>
        </View>

        <Text style={styles.label}>Graduation year</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gradYearRow}
        >
          {GRAD_YEARS.map((year) => {
            const selected = graduationYear === String(year);
            return (
              <TouchableOpacity
                key={year}
                onPress={() => setGraduationYear(String(year))}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={selected ? styles.chipTextSelected : styles.chipText}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Academic year</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gradYearRow}
        >
          {ACADEMIC_YEARS.map((year) => {
            const selected = academicYear === year;
            return (
              <TouchableOpacity
                key={year}
                onPress={() => setAcademicYear(year)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={selected ? styles.chipTextSelected : styles.chipText}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionSpacer} />
        <Text style={styles.sectionTitle}>Location</Text>

        <Text style={styles.label}>Location description</Text>
        <TextInput
          value={locationDescription}
          onChangeText={setLocationDescription}
          style={styles.input}
          placeholder="e.g. New York, NY or On campus"
          placeholderTextColor={COLORS.muted}
        />

        {Location && (
          <View style={styles.row}>
            <Text style={styles.label}>Coordinates (optional)</Text>
            <TouchableOpacity
              onPress={getCurrentLocation}
              disabled={locationLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: COLORS.primarySoft,
                borderRadius: 8,
              }}
            >
              <FontAwesome
                name="location-arrow"
                size={14}
                color={COLORS.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>
                {locationLoading ? 'Getting...' : 'Use Current'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: 12 }]}>Latitude</Text>
            <TextInput
              value={locationLat}
              onChangeText={setLocationLat}
              style={styles.input}
              placeholder="40.7128"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { fontSize: 12 }]}>Longitude</Text>
            <TextInput
              value={locationLon}
              onChangeText={setLocationLon}
              style={styles.input}
              placeholder="-74.0060"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.sectionSpacer} />
        <Text style={styles.sectionTitle}>Discovery</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Show me in discovery</Text>
            <Text style={[styles.label, { fontSize: 12, marginTop: 2 }]}>
              Allow others to see your profile
            </Text>
          </View>
          <Switch
            value={showMeInDiscovery}
            onValueChange={setShowMeInDiscovery}
            trackColor={{ false: '#CBD5E1', true: COLORS.primarySoft }}
            thumbColor={showMeInDiscovery ? COLORS.primary : '#FFFFFF'}
          />
        </View>

        {/* Note: Affiliations will need an API endpoint to fetch available affiliations */}
        {/* For now, we'll add a placeholder that can be enhanced later */}
        {profile.affiliations && profile.affiliations.length > 0 && (
          <>
            <View style={styles.sectionSpacer} />
            <Text style={styles.sectionTitle}>Affiliations</Text>
            <Text style={styles.label}>
              Selected: {affiliations.length} affiliation{affiliations.length !== 1 ? 's' : ''}
            </Text>
            <Text style={[styles.label, { fontSize: 12, marginTop: 2, color: COLORS.muted }]}>
              (Affiliation management coming soon)
            </Text>
          </>
        )}

        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={submit}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
          {onClose ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#eef2f7', marginTop: 10 }]}
              onPress={onClose}
            >
              <Text style={[styles.primaryButtonText, { color: COLORS.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
