/**
 * LikesDislikesScreen (Section 4.3)
 *
 * Profile onboarding: add likes and dislikes (optional).
 * Reached from AcademicsScreen. On continue navigates to AddAffiliationsScreen.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import styles, { AUTH_GRADIENT_CONFIG } from '../../../../styles/AuthStyles.v3';
import PrimaryCTA from '../../components/PrimaryCTA';
import SlotInput from '../../components/SlotInput';

function padToThree(arr) {
  const a = Array.isArray(arr) ? arr.filter((s) => String(s ?? '').trim() !== '') : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

const LIKE_EXAMPLES = [
  'Iced coffee',
  'Baking',
  'Lifting',
  'Sports',
  'Late-night Wawa',
  'Cooking',
  "McGillin’s open mic night",
  'Cold brew',
  'Farmers’ markets',
  'New Deck quizzo',
  'Running',
];

const DISLIKE_EXAMPLES = [
  '8:30s',
  'Slow walkers',
  'VP basement',
  'Crowded gyms',
  'Being late',
  'Bad wi-fi',
  'Flaky plans',
  'Long lines',
  'Meetings that could have been emails',
  'Loud eaters',
  'Small talk',
  'Traffic',
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

export default function LikesDislikesScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const backPayloadRef = useRef({});

  const [likes, setLikes] = useState(() => padToThree(routeParams.likes));
  const [dislikes, setDislikes] = useState(() => padToThree(routeParams.dislikes));

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

  const cleanInput = (s) => (s ?? '').replace(/^\s+/, '');

  const slotInputStyle = [
    styles.input,
    {
      backgroundColor: 'rgba(255,255,255,0.07)',
      borderColor: 'rgba(255,255,255,0.14)',
    },
  ];

  const sectionLabelStyle = {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  };

  const phColor = styles.tokens?.placeholder ?? 'rgba(255,255,255,0.5)';

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
                    <Text style={sectionLabelStyle}>Likes</Text>
                  </View>

                  {likes.map((val, idx) => (
                    <SlotInput
                      key={`like-${idx}`}
                      value={val}
                      onChangeText={(v) => {
                        const next = [...likes];
                        next[idx] = cleanInput(v);
                        setLikes(next);
                      }}
                      onFocus={() => bumpLikePH(idx)}
                      placeholder={`Like #${idx + 1} (ex. ${likePH[idx]})`}
                      placeholderTextColor={phColor}
                      inputStyle={slotInputStyle}
                      autoCapitalize="sentences"
                      autoCorrect={true}
                    />
                  ))}
                </View>

                {/* Dislikes */}
                <View style={[styles.fieldBlock, { marginBottom: 18 }]}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={sectionLabelStyle}>Dislikes</Text>
                  </View>

                  {dislikes.map((val, idx) => (
                    <SlotInput
                      key={`dislike-${idx}`}
                      value={val}
                      onChangeText={(v) => {
                        const next = [...dislikes];
                        next[idx] = cleanInput(v);
                        setDislikes(next);
                      }}
                      onFocus={() => bumpDislikePH(idx)}
                      placeholder={`Dislike #${idx + 1} (ex. ${dislikePH[idx]})`}
                      placeholderTextColor={phColor}
                      inputStyle={slotInputStyle}
                      autoCapitalize="sentences"
                      autoCorrect={true}
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
