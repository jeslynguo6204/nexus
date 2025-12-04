// mobile/components/ProfileDetailsForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import styles, { COLORS } from '../styles/ProfileFormStyles';

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export default function ProfileDetailsForm({ profile, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [major, setMajor] = useState(profile.major || '');
  const [graduationYear, setGraduationYear] = useState(
    profile.graduation_year ? String(profile.graduation_year) : ''
  );

  function submit() {
    const gradYearNum = graduationYear ? Number(graduationYear) : undefined;
    onSave({
      displayName: displayName || undefined,
      bio: bio || undefined,
      major: major || undefined,
      graduationYear: gradYearNum,
    });
  }

  return (
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
  );
}
