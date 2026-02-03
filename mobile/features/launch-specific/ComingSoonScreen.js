import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6 } from '@expo/vector-icons';
import Constants from 'expo-constants';

import styles, { AUTH_GRADIENT_CONFIG } from '../../styles/AuthStyles.v3';

const GO_LIVE_DATE = new Date('2026-02-28T12:00:00'); // Launch B
const INVITE_LINK = 'https://sixdegrees.app/invite';

const QUIP_LINE_1 = "They say you can’t\nhurry love.";
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

const pad2 = (n) => String(n).padStart(2, '0');

function getTimingLine(userCount) {
  if (typeof userCount !== 'number') return "You’re early. That’s a good thing.";
  return userCount >= 100 ? "You’re right on time." : "You’re early. That’s a good thing.";
}

function formatPeopleWaiting(count) {
  if (typeof count !== 'number') return null;
  const label = count === 1 ? 'person' : 'people';
  return { n: count.toLocaleString(), rest: `${label} waiting` };
}

export default function ComingSoonScreen() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [userCount, setUserCount] = useState(null);

  const quipLine2 = useMemo(() => {
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    return QUIP_ROTATION[hash % QUIP_ROTATION.length];
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(`${getApiBase()}/users/count`);
        if (!res.ok) return;
        const json = await res.json();
        if (typeof json?.count === 'number') setUserCount(json.count);
      } catch (err) {
        if (__DEV__) console.log('ComingSoon: user count fetch failed', err?.message);
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `I’m on Six Degrees — a dating app just for Penn students. ` +
          `Matching goes live soon. Play matchmaker 💙🎓 ${INVITE_LINK}`,
        url: INVITE_LINK,
      });
    } catch (e) {}
  };

  const countdownText = timeLeft
    ? `${pad2(timeLeft.d)} · ${pad2(timeLeft.h)} · ${pad2(timeLeft.m)} · ${pad2(timeLeft.s)}`
    : null;

  const timingLine = getTimingLine(userCount);
  const waiting = formatPeopleWaiting(userCount);

  return (
    <LinearGradient
      colors={AUTH_GRADIENT_CONFIG.colors}
      start={AUTH_GRADIENT_CONFIG.start}
      end={AUTH_GRADIENT_CONFIG.end}
      style={styles.gradientFill}
    >
      {/* include bottom safe area so button never sits on the nav bar */}
      <SafeAreaView style={cs.container} edges={['top', 'bottom']}>
        <View style={cs.content}>
          {/* ---------------- TOP ---------------- */}
          <View style={cs.top}>
            <Text style={cs.appName}>SIXDEGREES</Text>
            <Text style={[styles.logo, cs.logoOverride]}>6°</Text>

            <Text style={cs.line1}>{QUIP_LINE_1}</Text>
            <Text style={cs.line2}>{quipLine2}</Text>
          </View>

          {/* ---------------- MIDDLE ---------------- */}
          <View style={cs.middle}>
            {/* Countdown card = timing only */}
            <View style={cs.timerPanel}>
              {countdownText ? (
                <>
                  <Text style={cs.countdown}>{countdownText}</Text>
                  <Text style={cs.hint}>until matching begins</Text>
                </>
              ) : (
                <>
                  <Text style={cs.countdownLive}>We’re live ✨</Text>
                  <Text style={cs.hint}>matching is on</Text>
                </>
              )}
            </View>

            {/* more space from timer */}
            <Text style={cs.timingLine}>{timingLine}</Text>

            {waiting && (
              <View style={cs.metricPill}>
                <Text style={cs.metricText}>
                  <Text style={cs.metricStrong}>{waiting.n}</Text> {waiting.rest}
                </Text>
              </View>
            )}
          </View>

          {/* ---------------- BOTTOM ---------------- */}
          <View style={cs.bottom}>
            <Text style={cs.matchmakerLead}>Know someone we should meet?</Text>

            <TouchableOpacity style={cs.shareButton} onPress={handleShare} activeOpacity={0.9}>
              <FontAwesome6 name="paper-plane" size={18} color="#1F6299" />
              <Text style={cs.shareText}>Play matchmaker</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const cs = {
  container: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28, // was huge; smaller + SafeArea bottom keeps CTA off nav bar
    justifyContent: 'space-between',
  },

  // -------- Top (brand + hook) --------
  top: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  appName: {
    fontSize: 14,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#E5F2FF',
    opacity: 0.75,
    marginBottom: 10,
  },

  logoOverride: {
    fontSize: 84,
    marginBottom: 16,
  },

  line1: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 10,
  },

  line2: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },

  // -------- Middle --------
  middle: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  timerPanel: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: -32, // subtle lift (move countdown up a little)
    marginBottom: 12,
  },

  countdown: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    marginBottom: 6,
  },

  countdownLive: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },

  hint: {
    fontSize: 13,
    color: '#E5F2FF',
    opacity: 0.78,
    textAlign: 'center',
  },

  // big space between timer and "You're early..."
  timingLine: {
    marginTop: 32, // increase separation from countdown
    fontSize: 16,
    color: '#E5F2FF',
    opacity: 0.86,
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  metricPill: {
    marginTop: 12, // separation between timing line and people waiting
    marginBottom: -12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  
  },

  metricText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.92,
    textAlign: 'center',
  },

  metricStrong: {
    fontWeight: '800',
  },

  // -------- Bottom --------
  bottom: {
    alignItems: 'center',
    marginBottom: 18, // lifts the whole bottom stack up off the nav bar area
  },

  matchmakerLead: {
    fontSize: 15,
    color: '#E5F2FF',
    opacity: 0.84,
    textAlign: 'center',
    marginBottom: 12, // spacing above button
    letterSpacing: 0.2,
  },

  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  shareText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F6299',
    letterSpacing: 0.2,
  },
};
