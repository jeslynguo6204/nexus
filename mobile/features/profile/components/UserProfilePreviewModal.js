import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { getIdToken } from '../../../auth/tokens';
import { getUserProfile } from '../../../api/profileAPI';
import PreviewModal from './PreviewModal';
import ProfileCard from '../../home/components/ProfileCard';

/**
 * Reusable modal that fetches and displays a user's profile (ProfileCard) by userId.
 * Used in Chat (header tap) and Friends list (row tap).
 *
 * Props:
 *   - visible: boolean
 *   - userId: number | null (user to fetch)
 *   - onClose: () => void
 */
export default function UserProfilePreviewModal({
  visible,
  userId,
  onClose,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setProfile(null);

    (async () => {
      try {
        const token = await getIdToken();
        if (!token || cancelled) return;
        const data = await getUserProfile(token, userId);
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          console.error('UserProfilePreviewModal fetch error:', e);
          Alert.alert('Error', 'Failed to load profile. Please try again.');
          onClose?.();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [visible, userId, onClose]);

  return (
    <PreviewModal visible={visible} onClose={onClose}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : profile ? (
        <View
          style={{
            width: Dimensions.get('window').width - 32,
            height: Math.min(
              (Dimensions.get('window').width - 32) * 1.6,
              Dimensions.get('window').height * 0.55
            ),
          }}
        >
          <ProfileCard
            profile={profile}
            photos={profile.photos}
            disableUpwardExpansion
          />
        </View>
      ) : null}
    </PreviewModal>
  );
}
