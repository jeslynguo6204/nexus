// mobile/components/ProfilePreferencesForm.js

/**
 * ProfilePreferencesForm is a reusable form component for editing a user's profile 
 * preferences, such as their dating and friends modes, gender preferences, age 
 * range, and maximum distance.
 * 
 * Like the ProfileDetailsForm, it is used within the ProfileScreen to allow users 
 * to edit a specific section of their profile. When the form is submitted, it calls
 * the onSave prop with the updated preference fields, which the ProfileScreen 
 * handles by making an API call to update the user's profile on the server.
 * 
 * The form is pre-populated with the user's current preferences, which are passed 
 * in as the profile prop. It uses various input components like switches, sliders, 
 * and buttons to provide an intuitive interface for adjusting these settings.
 * 
 * By allowing users to control their discovery preferences, this form component 
 * helps to tailor the user's experience on the app and improve the relevance of the
 * potential matches they see on the HomeScreen.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import styles, { COLORS } from '../styles/ProfileFormStyles';

const GENDER_OPTIONS = ['male', 'female', 'non-binary', 'everyone'];

export default function ProfilePreferencesForm({ profile, onSave, onClose }) {
  const [isDatingEnabled, setIsDatingEnabled] = useState(
    profile.is_dating_enabled ?? true
  );
  const [isFriendsEnabled, setIsFriendsEnabled] = useState(
    profile.is_friends_enabled ?? false
  );

  const [datingGenderPreference, setDatingGenderPreference] = useState(
    profile.dating_gender_preference || 'everyone'
  );
  const [friendsGenderPreference, setFriendsGenderPreference] = useState(
    profile.friends_gender_preference || 'everyone'
  );

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

  function submit() {
    const maxDistanceKm = Math.round(maxDistanceMiles * 1.60934);
    onSave({
      isDatingEnabled,
      isFriendsEnabled,
      datingGenderPreference,
      friendsGenderPreference,
      minAgePreference,
      maxAgePreference,
      maxDistanceKm,
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text style={[styles.sectionTitle, styles.firstSectionTitle]}>
            Settings
          </Text>
          {onClose ? (
            <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
              <FontAwesome name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Modes</Text>
        <View style={styles.row}>
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

        <Text style={styles.sectionTitle}>Who you want to see</Text>

        <Text style={styles.subLabel}>Dating</Text>
        <View style={styles.chipRow}>
          {GENDER_OPTIONS.map((opt) => {
            const selected = datingGenderPreference === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setDatingGenderPreference(opt)}
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
            const selected = friendsGenderPreference === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setFriendsGenderPreference(opt)}
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
  );
}
