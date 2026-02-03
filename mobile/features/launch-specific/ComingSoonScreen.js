import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import Constants from 'expo-constants';

import styles, { AUTH_GRADIENT_CONFIG } from '../../styles/AuthStyles.v3';

const GO_LIVE_DATE = new Date('2026-02-28T12:00:00'); // Launch B
const INVITE_LINK = 'https://sixdegrees.app/invite';

const QUIP_LINE_1 = "They say you can’t hurry love.";
const QUIP_ROTATION = [
  "We’re still counting the seconds.",
  "We’d rather not test that.",
  "But you can definitely count down to it.",
  "We think you’ve waited long enough.",
];

function getApiBase() {
  return Constants?.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';
}

function getTimeLeft() {
  const diff = GO_LIVE_DATE - new Date();
  if (diff <= 0) return null;

  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

const pad = (n) => String(n).padStart(2, '0');

export default function ComingSoonScreen() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [userCount, setUserCount] = useState(null);

  // rotate by local day
  const quipLine2 = useMemo(() => {
    const d = new Date();
    const idx = d.getDate() % QUIP_ROTATION.length;
    return QUIP_ROTATION[idx];
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function fetchCount() {
      try {
        const url = `${getApiBase()}/users/count`;
        console.log('Fetching user count from:', url);
        const res = await fetch(url);
        const text = await res.text();
        console.log('Raw response:', text.substring(0, 200));
        const json = JSON.parse(text);
        console.log('User count response:', json);
        if (typeof json?.count === 'number') setUserCount(json.count);
      } catch (err) {
        console.error('Failed to fetch user count:', err);
      }
    }
    fetchCount();
  }, []);

  const handleShare = async () => {
    await Share.share({
      message:
        `I’m on Six Degrees — a dating app just for Penn students. ` +
        `Profiles are open, matching goes live soon. Play matchmaker 💙🎓 ${INVITE_LINK}`,
      url: INVITE_LINK,
    });
  };

  return (
    <LinearGradient
      colors={AUTH_GRADIENT_CONFIG.colors}
      start={AUTH_GRADIENT_CONFIG.start}
      end={AUTH_GRADIENT_CONFIG.end}
      style={styles.gradientFill}
    >
      <SafeAreaView style={cs.container} edges={['top']}>
        <View style={cs.content}>

          {/* ---------- TOP ---------- */}
          <View style={cs.top}>
            <Text style={styles.logo}>6°</Text>
            <Text style={cs.status}>Profiles open Valentine’s Day</Text>
          </View>

          {/* ---------- MIDDLE ---------- */}
          <View style={cs.middle}>
            <Text style={cs.line1}>{QUIP_LINE_1}</Text>
            <Text style={cs.line2}>{quipLine2}</Text>

            {timeLeft && (
              <>
                <Text style={cs.countdown}>
                  {pad(timeLeft.d)} · {pad(timeLeft.h)} · {pad(timeLeft.m)} · {pad(timeLeft.s)}
                </Text>
                <Text style={cs.hint}>until we go live</Text>
              </>
            )}

            {userCount !== null && (
              <Text style={cs.social}>
                <Text style={cs.socialStrong}>{userCount.toLocaleString()}</Text> people are already in
              </Text>
            )}
          </View>

          {/* ---------- BOTTOM ---------- */}
          <View style={cs.bottom}>
            <TouchableOpacity
              style={cs.shareButton}
              onPress={handleShare}
              activeOpacity={0.9}
            >
              <FontAwesome6 name="paper-plane" size={18} color="#1F6299" />
              <Text style={cs.shareText}>Play matchmaker</Text>
            </TouchableOpacity>

            <Text style={cs.penn}>Built for Penn. Best with your people.</Text>
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Local styles                                 */
/* -------------------------------------------------------------------------- */

const cs = {
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,      // ⬅️ key fix: logo comes DOWN
    paddingBottom: 100,  // Extra padding for transparent tab bar
    justifyContent: 'space-between',
  },

  top: {
    alignItems: 'center',
  },
  status: {
    marginTop: 6,
    fontSize: 14,
    color: '#E5F2FF',
    opacity: 0.9,
  },

  middle: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  line1: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 30,
  },
  line2: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 28,
    textAlign: 'center',
  },

  countdown: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  hint: {
    marginTop: 6,
    fontSize: 13,
    color: '#E5F2FF',
    opacity: 0.75,
    marginBottom: 16,
  },

  social: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  socialStrong: {
    fontWeight: '800',
  },

  bottom: {
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    gap: 10,
  },
  shareText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F6299',
  },
  penn: {
    marginTop: 12,
    fontSize: 14,
    color: '#E5F2FF',
    opacity: 0.85,
    textAlign: 'center',
  },
};
