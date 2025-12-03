import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';

export default function ProfileForm({ profile, onSave }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [major, setMajor] = useState(profile.major || '');
  const [graduationYear, setGraduationYear] = useState(profile.graduation_year ? String(profile.graduation_year) : '');

  function submit() {
    const payload = {
      displayName: displayName || undefined,
      bio: bio || undefined,
      major: major || undefined,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
    };
    onSave(payload);
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Your profile</Text>

      <Text>Display name</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} style={{ borderBottomWidth: 1, marginBottom: 12 }} />

      <Text>Bio</Text>
      <TextInput value={bio} onChangeText={setBio} multiline style={{ borderWidth: 1, padding: 8, marginBottom: 12, height: 100 }} />

      <Text>Major</Text>
      <TextInput value={major} onChangeText={setMajor} style={{ borderBottomWidth: 1, marginBottom: 12 }} />

      <Text>Graduation year</Text>
      <TextInput value={graduationYear} onChangeText={setGraduationYear} keyboardType="numeric" style={{ borderBottomWidth: 1, marginBottom: 12 }} />

      <Button title="Save" onPress={submit} />
    </ScrollView>
  );
}
