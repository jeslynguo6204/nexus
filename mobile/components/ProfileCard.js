// mobile/components/ProfileCard.js
import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../styles/ProfileCardStyles';

export default function ProfileCard({ profile }) {
  const {
    display_name,
    age,
    bio,
    major,
    graduation_year,
    photoUrl, // adapt to your schema
  } = profile;

  const initials =
    display_name &&
    display_name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.imageArea}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.placeholderInitials}>{initials}</Text>
        )}
      </View>

      <View style={styles.nameRow}>
        <Text style={styles.name}>{display_name}</Text>
        {age && <Text style={styles.age}>{age}</Text>}
      </View>

      <View style={styles.metaRow}>
        {major && (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{major}</Text>
          </View>
        )}
        {graduation_year && (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{'Class of ' + graduation_year}</Text>
          </View>
        )}
      </View>

      {bio ? <Text style={styles.bio}>{bio}</Text> : null}
    </View>
  );
}
