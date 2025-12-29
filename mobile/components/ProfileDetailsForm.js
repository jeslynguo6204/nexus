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
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styles, { COLORS } from '../styles/ProfileFormStyles';

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export default function ProfileDetailsForm({ profile, onSave, onClose }) {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [major, setMajor] = useState(profile.major || '');
  const [graduationYear, setGraduationYear] = useState(
    profile.graduation_year ? String(profile.graduation_year) : ''
  );

  const schoolLabel =
    profile?.school?.name ||
    profile?.school_name ||
    profile?.school?.short_name ||
    'School not set';

  function submit() {
    const gradYearNum = graduationYear ? Number(graduationYear) : null;
    const nextBio = bio.trim() === '' ? null : bio;
    const nextMajor = major.trim() === '' ? null : major;
    const nextDisplayName = displayName.trim() === '' ? null : displayName;
    onSave({
      displayName: nextDisplayName,
      bio: nextBio,
      major: nextMajor,
      graduationYear: gradYearNum,
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
