// mobile/components/ProfileForm.js

/**
 * ProfileForm is a comprehensive form component for managing a user's profile in a 
 * college social app. It combines the functionality of the ProfileDetailsForm and 
 * ProfilePreferencesForm components into a single form.
 * 
 * The form is divided into several sections:
 * - Basic profile details: display name, bio, major, graduation year
 * - Modes: toggles for enabling/disabling dating and friends modes
 * - Gender preferences: options for who the user wants to see in each mode
 * - Age range: sliders for setting minimum and maximum age preferences
 * - Distance: slider for setting maximum search distance
 * - Location: freeform text input for user's description of their location
 * 
 * The component is pre-populated with the user's existing profile data passed in via 
 * props. It provides an onSave callback which is triggered when the form is submitted
 * after passing validation checks.
 * 
 * Reusable UI components and styles are imported from ../styles/ProfileFormStyles.
 * 
 * This form is designed to be used in the initial profile setup flow for new users, 
 * but can also be adapted for the profile edit screen by pre-populating the form 
 * fields with the user's existing data.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import styles, { COLORS } from '../../../styles/ProfileFormStyles';

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const GENDER_OPTIONS = ['male', 'female', 'non-binary'];
const filterValidGenderPrefs = (arr) => Array.isArray(arr) ? arr.filter((v) => GENDER_OPTIONS.includes(v)) : [];

export default function ProfileForm({ profile, onSave }) {
  // Basic info
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [major, setMajor] = useState(profile.major || '');
  const [graduationYear, setGraduationYear] = useState(
    profile.graduation_year ? String(profile.graduation_year) : ''
  );

  // Modes
  const [isDatingEnabled, setIsDatingEnabled] = useState(
    profile.is_dating_enabled ?? true
  );
  const [isFriendsEnabled, setIsFriendsEnabled] = useState(
    profile.is_friends_enabled ?? false
  );

  // Gender preferences (array: at least one, up to 3; filter out legacy "everyone")
  const [datingGenderPreference, setDatingGenderPreference] = useState(() => {
    const filtered = filterValidGenderPrefs(profile.dating_gender_preference);
    return filtered.length > 0 ? filtered : [];
  });
  const [friendsGenderPreference, setFriendsGenderPreference] = useState(() => {
    const filtered = filterValidGenderPrefs(profile.friends_gender_preference);
    return filtered.length > 0 ? filtered : [];
  });

  // Age / distance preferences
  const [minAgePreference, setMinAgePreference] = useState(
    profile.min_age_preference || 18
  );
  const [maxAgePreference, setMaxAgePreference] = useState(
    profile.max_age_preference || 24
  );

  const initialDistanceMiles = profile.max_distance_km
    ? Math.round(profile.max_distance_km / 1.60934)
    : 5;
  const [maxDistanceMiles, setMaxDistanceMiles] = useState(initialDistanceMiles);

  // Human-readable location
  const [locationDescription, setLocationDescription] = useState(
    profile.location_description || ''
  );

  function validate() {
    const gradYearNum = graduationYear ? Number(graduationYear) : undefined;
    if (
      graduationYear &&
      (Number.isNaN(gradYearNum) || gradYearNum < 2020 || gradYearNum > 2040)
    ) {
      Alert.alert('Invalid graduation year', 'Please enter a valid graduation year.');
      return false;
    }

    if (minAgePreference < 18) {
      Alert.alert('Invalid age', 'Minimum age must be at least 18.');
      return false;
    }

    if (minAgePreference > maxAgePreference) {
      Alert.alert('Invalid age range', 'Min age cannot be greater than max age.');
      return false;
    }

    if (isDatingEnabled && (!Array.isArray(datingGenderPreference) || datingGenderPreference.length === 0)) {
      Alert.alert('Dating preference', 'Select at least one option for who you want to see (dating).');
      return false;
    }
    if (isFriendsEnabled && (!Array.isArray(friendsGenderPreference) || friendsGenderPreference.length === 0)) {
      Alert.alert('Friends preference', 'Select at least one option for who you want to see (friends).');
      return false;
    }

    return true;
  }

  function submit() {
    if (!validate()) return;

    const gradYearNum = graduationYear ? Number(graduationYear) : undefined;
    const maxDistanceKm = Math.round(maxDistanceMiles * 1.60934);

    const datingFiltered = filterValidGenderPrefs(datingGenderPreference).slice(0, 3);
    const friendsFiltered = filterValidGenderPrefs(friendsGenderPreference).slice(0, 3);
    const datingPref = datingFiltered.length > 0 ? datingFiltered : null;
    const friendsPref = friendsFiltered.length > 0 ? friendsFiltered : null;

    const payload = {
      displayName: displayName || undefined,
      bio: bio || undefined,
      major: major || undefined,
      graduationYear: gradYearNum,

      isDatingEnabled,
      isFriendsEnabled,

      datingGenderPreference: datingPref,
      friendsGenderPreference: friendsPref,

      minAgePreference,
      maxAgePreference,
      maxDistanceKm,

      locationDescription: locationDescription || undefined,
    };

    onSave(payload);
  }

  function handleMinAgeChange(value) {
    const newMin = Math.round(value);
    setMinAgePreference(newMin);
    if (newMin > maxAgePreference) setMaxAgePreference(newMin);
  }

  function handleMaxAgeChange(value) {
    const newMax = Math.round(value);
    setMaxAgePreference(newMax);
    if (newMax < minAgePreference) setMinAgePreference(newMax);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        {/* Profile */}
        <Text style={[styles.sectionTitle, styles.firstSectionTitle]}>
          Your profile
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

        <View style={styles.sectionSpacer} />

        {/* Modes */}
        <Text style={styles.sectionTitle}>Modes</Text>

        <View className="row" style={styles.row}>
          <Text style={styles.label}>Dating mode</Text>
          <Switch
            value={isDatingEnabled}
            onValueChange={setIsDatingEnabled}
            trackColor={{ false: '#CBD5E1', true: COLORS.primarySoft }}
            thumbColor={isDatingEnabled ? COLORS.primary : '#FFFFFF'}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Friends mode</Text>
          <Switch
            value={isFriendsEnabled}
            onValueChange={setIsFriendsEnabled}
            trackColor={{ false: '#CBD5E1', true: COLORS.primarySoft }}
            thumbColor={isFriendsEnabled ? COLORS.primary : '#FFFFFF'}
          />
        </View>

        <View style={styles.sectionSpacer} />

        {/* Gender preferences */}
        <Text style={styles.sectionTitle}>Who you want to see</Text>

        <Text style={styles.subLabel}>Dating</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTIONS.map((opt) => {
            const selected = Array.isArray(datingGenderPreference) && datingGenderPreference.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  const arr = Array.isArray(datingGenderPreference) ? [...datingGenderPreference] : [];
                  if (selected) {
                    const next = arr.filter((x) => x !== opt);
                    if (next.length > 0) setDatingGenderPreference(next);
                  } else {
                    setDatingGenderPreference([...arr, opt]);
                  }
                }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={selected ? styles.chipTextSelected : styles.chipText}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.subLabel}>Friends</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTIONS.map((opt) => {
            const selected = Array.isArray(friendsGenderPreference) && friendsGenderPreference.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  const arr = Array.isArray(friendsGenderPreference) ? [...friendsGenderPreference] : [];
                  if (selected) {
                    const next = arr.filter((x) => x !== opt);
                    if (next.length > 0) setFriendsGenderPreference(next);
                  } else {
                    setFriendsGenderPreference([...arr, opt]);
                  }
                }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={selected ? styles.chipTextSelected : styles.chipText}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionSpacer} />

        {/* Age range */}
        <Text style={styles.sectionTitle}>Age range</Text>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.subLabel}>Preferred ages</Text>
          <Text style={styles.subLabel}>
            {minAgePreference} – {maxAgePreference}
          </Text>
        </View>

        <Text style={styles.label}>Minimum age</Text>
        <Slider
          minimumValue={18}
          maximumValue={40}
          step={1}
          value={minAgePreference}
          onValueChange={handleMinAgeChange}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.primarySoft}
          thumbTintColor={COLORS.primary}
        />

        <Text style={styles.label}>Maximum age</Text>
        <Slider
          minimumValue={18}
          maximumValue={40}
          step={1}
          value={maxAgePreference}
          onValueChange={handleMaxAgeChange}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.primarySoft}
          thumbTintColor={COLORS.primary}
        />

        <View style={styles.sectionSpacer} />

        {/* Distance */}
        <Text style={styles.sectionTitle}>Maximum distance</Text>
        <View style={styles.sliderLabelRow}>
          <Text style={styles.subLabel}>Show people within</Text>
          <Text style={styles.subLabel}>
            {maxDistanceMiles < 1 ? '< 1 mile' : `${maxDistanceMiles} miles`}
          </Text>
        </View>
        <Slider
          minimumValue={0.5}
          maximumValue={50}
          step={0.5}
          value={maxDistanceMiles}
          onValueChange={(v) => setMaxDistanceMiles(Number(v.toFixed(1)))}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.primarySoft}
          thumbTintColor={COLORS.primary}
        />

        <View style={styles.sectionSpacer} />

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.label}>Where are you?</Text>
        <TextInput
          value={locationDescription}
          onChangeText={setLocationDescription}
          style={styles.input}
          placeholder="e.g. Campus, city, dorm"
          placeholderTextColor={COLORS.muted}
        />

        {/* Save button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={submit}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
