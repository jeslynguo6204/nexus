import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

/**
 * Launch A (Profiles open): Valentine’s Day
 * Launch B (Go live / matching): the countdown is for this.
 *
 * Update these as needed.
 */
const PROFILE_OPEN_DATE = new Date('2026-02-14T12:00:00'); // Launch A
const GO_LIVE_DATE = new Date('2026-02-28T12:00:00');      // Launch B (example — change this!)
const INVITE_LINK = 'https://sixdegrees.app/invite';

function getApiBase() {
  return Constants?.expoConfig?.extra?.apiBaseUrl || 'http://localhost:4000';
}

const QUIP_LINE_1 = "They say you can’t hurry love.";
const QUIP_ROTATION = [
  "We’re still counting the seconds.",
  "We’d rather not test that.",
  "But you can definitely count down to it.",
  "We think you’ve waited long enough.",
];

function ComingSoonScreen() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [userCount, setUserCount] = useState(null);

  // Rotate quip by day (local). Stable across opens on the same day.
  const quipLine2 = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; // local date key
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return QUIP_ROTATION[hash % QUIP_ROTATION.length];
  }, []);

  function getTimeLeft() {
    const now = new Date();
    const diff = GO_LIVE_DATE - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchUserCount() {
      try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/users/count`);
        if (!response.ok) return;
        const data = await response.json();
        if (typeof data?.count === 'number') setUserCount(data.count);
      } catch (error) {
        if (__DEV__) console.log('ComingSoon: could not fetch user count', error?.message);
      }
    }
    fetchUserCount();
    const interval = setInterval(fetchUserCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `I’m on Six Degrees — a dating app just for Penn students. ` +
          `Profiles open Feb 14, matching goes live soon. Play matchmaker? 💙🎓 ` +
          `${INVITE_LINK}`,
        url: INVITE_LINK,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <LinearGradient colors={['#1F6299', '#34A4FF']} style={styles.container}>
      <View style={styles.content}>
        {/* Top: logo + subtle status */}
        <View style={styles.topBlock}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>6°</Text>
          </View>

          <Text style={styles.statusText}>
            Profiles open Valentine’s Day
          </Text>
        </View>

        {/* Center: quip + countdown */}
        <View style={styles.centerBlock}>
          <Text style={styles.poemLine1}>{QUIP_LINE_1}</Text>
          <Text style={styles.poemLine2}>{quipLine2}</Text>

          {timeLeft && (
            <>
              <Text style={styles.countdown}>
                {String(timeLeft.days).padStart(2, '0')} ·{' '}
                {String(timeLeft.hours).padStart(2, '0')} ·{' '}
                {String(timeLeft.minutes).padStart(2, '0')} ·{' '}
                {String(timeLeft.seconds).padStart(2, '0')}
              </Text>
              <Text style={styles.countdownHint}>until we go live</Text>
            </>
          )}

          {userCount !== null && (
            <View style={styles.userCountPill}>
              <FontAwesome6 name="users" size={14} color="#FFFFFF" style={{ opacity: 0.85 }} />
              <Text style={styles.userCountText}>
                <Text style={styles.userCountNumber}>{userCount.toLocaleString()}</Text>
                {' '}people are already in
              </Text>
            </View>
          )}
        </View>

        {/* Lower: CTA + microcopy */}
        <View style={styles.bottomBlock}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.9}>
            <FontAwesome6 name="paper-plane" size={18} color="#1F6299" />
            <Text style={styles.shareButtonText}>Play matchmaker</Text>
          </TouchableOpacity>

          <Text style={styles.inviteSubtext}>
            Built for Penn. Best with your people.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 44,
  },

  topBlock: {
    alignItems: 'center',
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#1F6299',
    fontSize: 28,
    fontWeight: '800',
  },

  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
    letterSpacing: 0.3,
  },

  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  poemLine1: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },

  poemLine2: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 22,
  },

  countdown: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  countdownHint: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.75,
    marginTop: 8,
    marginBottom: 18,
  },

  userCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },

  userCountText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    opacity: 0.95,
  },

  userCountNumber: {
    fontWeight: '800',
  },

  bottomBlock: {
    alignItems: 'center',
  },

  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 999,
    gap: 10,
  },

  shareButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F6299',
  },

  inviteSubtext: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.78,
    marginTop: 14,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
});

export default ComingSoonScreen;
