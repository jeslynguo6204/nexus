/**
 * LikesDislikesScreen (Section 4.3)
 *
 * Profile onboarding: add likes and dislikes. At least 1 like required.
 * Reached from AcademicsScreen. On continue navigates to AddAffiliationsScreen.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import styles, { AUTH_GRADIENT_CONFIG } from '../../../../styles/AuthStyles.v3';
import PrimaryCTA from '../../components/PrimaryCTA'; // adjust path if needed

function padToThree(arr) {
  const a = Array.isArray(arr) ? arr.filter((s) => String(s ?? '').trim() !== '') : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

const LIKE_EXAMPLES = [
  'iced coffee',
  'baking',
  'lifting',
  'sports',
  'late-night wawa',
  'cooking',
  "mcgillin’s open mic night",
  'cold brew',
  'farmers’ markets',
  'new deck quizzo',
  'running',
];

const DISLIKE_EXAMPLES = [
  '8:30s',
  'slow walkers',
  'vp basement',
  'crowded gyms',
  'people who don’t rerack weights',
  'being late',
  'bad wi-fi',
  'flaky plans',
  'long lines',
  'meetings that could have been emails',
  'loud eaters',
  'small talk',
  'traffic',
];

function useRotatingPlaceholders(examples, count = 3) {
  // Stable shuffled pool per mount so it doesn’t feel repetitive
  const pool = useMemo(() => {
    const copy = [...examples];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [examples]);

  const idxRef = useRef(0);
  const next = () => {
    const value = pool[idxRef.current % pool.length];
    idxRef.current += 1;
    return value;
  };

  const [placeholders, setPlaceholders] = useState(() =>
    Array.from({ length: count }, () => next())
  );

  const bumpOne = (slotIndex) => {
    setPlaceholders((prev) => {
      const copy = [...prev];
      copy[slotIndex] = next();
      return copy;
    });
  };

  return { placeholders, bumpOne };
}

function SlotInput({
  value,
  onChangeText,
  placeholder,
  onFocus,
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={styles.tokens?.placeholder ?? 'rgba(255,255,255,0.5)'}
        style={[
          styles.input,
          {
            // slightly flatter than default input so it feels “slot-like”
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderColor: 'rgba(255,255,255,0.14)',
          },
        ]}
        autoCapitalize="sentences"
        returnKeyType="done"
      />
    </View>
  );
}

export default function LikesDislikesScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const backPayloadRef = useRef({});

  const [likes, setLikes] = useState(() => padToThree(routeParams.likes));
  const [dislikes, setDislikes] = useState(() => padToThree(routeParams.dislikes));
  const [likeError, setLikeError] = useState('');

  const { placeholders: likePH, bumpOne: bumpLikePH } = useRotatingPlaceholders(LIKE_EXAMPLES, 3);
  const { placeholders: dislikePH, bumpOne: bumpDislikePH } = useRotatingPlaceholders(DISLIKE_EXAMPLES, 3);

  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLikes(padToThree(routeParams.likes));
    setDislikes(padToThree(routeParams.dislikes));
  }, [routeParams.likes, routeParams.dislikes]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const filledLikes = likes.map((l) => l.trim()).filter(Boolean);
  const filledDislikes = dislikes.map((d) => d.trim()).filter(Boolean);

  function handleContinue() {
    setLikeError('');
    if (filledLikes.length < 1) {
      setLikeError('Add at least one');
      return;
    }

    navigation.navigate('AddAffiliationsScreen', {
      ...routeParams,
      ...backPayloadRef.current,
      likes: filledLikes,
      dislikes: filledDislikes,
      onBackWithData: (data) => {
        backPayloadRef.current = data;
      },
    });
  }

  function handleSkip() {
    navigation.navigate('AddAffiliationsScreen', {
      ...routeParams,
      ...backPayloadRef.current,
      onBackWithData: (data) => {
        backPayloadRef.current = data;
      },
    });
  }

  function handleBack() {
    routeParams.onBackWithData?.({ likes: filledLikes, dislikes: filledDislikes });
    navigation.goBack();
  }

  return (
    <LinearGradient
      colors={AUTH_GRADIENT_CONFIG.colors}
      start={AUTH_GRADIENT_CONFIG.start}
      end={AUTH_GRADIENT_CONFIG.end}
      style={styles.gradientFill}
    >
      <SafeAreaView style={styles.authContainer} edges={['top', 'left', 'right']}>
        {/* Back */}
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { top: insets.top + 4 }]}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: 'absolute',
            right: 16,
            top: insets.top + 4,
            zIndex: 30,
            paddingHorizontal: 8,
            paddingVertical: 8,
          }}
        >
          <Text style={[styles.backText, { opacity: 0.9 }]}>Skip →</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.authContent, { paddingTop: 8 }]}>
              {/* Small app name at top */}
              <Text
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  color: '#E5F2FF',
                  opacity: 0.75,
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                SIX DEGREES
              </Text>

              <View style={{ alignItems: 'center', marginTop: 2 }}>
                <Text style={styles.title}>It’s the little things.</Text>
                <Text style={styles.subtitle}>The good, the bad — and the occasional dealbreaker.</Text>
              </View>

              <Animated.View style={[styles.formWrap, { opacity: fadeAnim, marginTop: 14 }]}>
                {/* Likes */}
                <View style={[styles.fieldBlock, { marginBottom: 22 }]}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.label}>Likes</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.65)' }}>
                      Up to 3
                    </Text>
                  </View>

                  {!!likeError && (
                    <Text style={[styles.inlineError, { marginTop: 6 }]}>{likeError}</Text>
                  )}

                  {likes.map((val, idx) => (
                    <SlotInput
                      key={`like-${idx}`}
                      value={val}
                      onChangeText={(v) => {
                        const next = [...likes];
                        next[idx] = v;
                        setLikes(next);
                        if (likeError) setLikeError('');
                      }}
                      onFocus={() => bumpLikePH(idx)}
                      placeholder={`Add a like (e.g. ${likePH[idx]})`}
                    />
                  ))}
                </View>

                {/* Dislikes */}
                <View style={[styles.fieldBlock, { marginBottom: 18 }]}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.label}>Dislikes</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.65)' }}>
                      Optional
                    </Text>
                  </View>

                  {dislikes.map((val, idx) => (
                    <SlotInput
                      key={`dislike-${idx}`}
                      value={val}
                      onChangeText={(v) => {
                        const next = [...dislikes];
                        next[idx] = v;
                        setDislikes(next);
                      }}
                      onFocus={() => bumpDislikePH(idx)}
                      placeholder={`Add a dislike (e.g. ${dislikePH[idx]})`}
                    />
                  ))}

                  <Text style={{ marginTop: 8, fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>
                    You can always edit these later.
                  </Text>
                </View>

                <PrimaryCTA
  label="Continue"
  onPress={handleContinue}
  buttonStyle={styles.primaryButton}
  textStyle={styles.primaryButtonText}
/>

              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
