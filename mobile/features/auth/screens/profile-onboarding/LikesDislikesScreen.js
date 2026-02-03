/**
 * LikesDislikesScreen (Section 4.3)
 *
 * Profile onboarding: add likes and dislikes. At least 1 like required.
 * Reached from AcademicsScreen. On continue navigates to AddAffiliationsScreen.
 */
import React, { useEffect, useRef, useState } from 'react';
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
import styles from '../../../../styles/AuthStyles';

function ItemInput({ value, onChangeText, placeholder, onRemovePress }) {
  return (
    <View style={{ marginBottom: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: '500',
          minHeight: 44,
        }}
      />
      {value.trim() !== '' && (
        <TouchableOpacity
          onPress={onRemovePress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: 'rgba(255,59,48,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FF3B30', fontSize: 18, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function padToThree(arr) {
  const a = Array.isArray(arr) ? arr.filter((s) => String(s ?? '').trim() !== '') : [];
  return [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
}

export default function LikesDislikesScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const [likes, setLikes] = useState(() => padToThree(routeParams.likes));
  const [dislikes, setDislikes] = useState(() => padToThree(routeParams.dislikes));

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

  const filledLikes = likes.filter((l) => l.trim() !== '');
  const filledDislikes = dislikes.filter((d) => d.trim() !== '');

  function handleContinue() {
    navigation.navigate('AddAffiliationsScreen', {
      ...routeParams,
      likes: filledLikes,
      dislikes: filledDislikes,
    });
  }

  function handleSkip() {
    navigation.navigate('AddAffiliationsScreen', { ...routeParams });
  }

  function handleBack() {
    navigation.navigate('AcademicsScreen', {
      ...routeParams,
      likes: filledLikes,
      dislikes: filledDislikes,
    });
  }

  return (
    <LinearGradient
      colors={['#1F6299', '#34A4FF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.entryContainer} edges={['top', 'left', 'right']}>
        <TouchableOpacity
          onPress={handleBack}
          style={{ position: 'absolute', left: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSkip}
          style={{ position: 'absolute', right: 16, top: insets.top + 4, zIndex: 20 }}
        >
          <Text style={{ color: '#E5F2FF', fontSize: 15 }}>Skip →</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingTop: 12, paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.entryTop, { marginTop: 12 }]}>
              <Text style={styles.entryTagline}>What are you into?</Text>
            </View>

            <Animated.View style={[{ width: '100%', paddingHorizontal: 24, opacity: fadeAnim }]}>
              <Text style={{ fontSize: 14, color: '#E5E7EB', textAlign: 'center', marginBottom: 32 }}>
                A few things that make you… you.
              </Text>

              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#E5F2FF', marginBottom: 12 }}>
                  Likes
                </Text>
                <ItemInput
                  value={likes[0]}
                  onChangeText={(v) => setLikes([v, likes[1], likes[2]])}
                  placeholder="e.g. Sushi"
                  onRemovePress={() => setLikes(['', likes[1], likes[2]])}
                />
                <ItemInput
                  value={likes[1]}
                  onChangeText={(v) => setLikes([likes[0], v, likes[2]])}
                  placeholder="e.g. AirPods"
                  onRemovePress={() => setLikes([likes[0], '', likes[2]])}
                />
                <ItemInput
                  value={likes[2]}
                  onChangeText={(v) => setLikes([likes[0], likes[1], v])}
                  placeholder="e.g. Candlelit dinners"
                  onRemovePress={() => setLikes([likes[0], likes[1], ''])}
                />
              </View>

              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#E5F2FF', marginBottom: 12 }}>
                  Dislikes
                </Text>
                <Text style={{ fontSize: 12, color: '#C5D0DC', marginBottom: 12 }}>
                  Optional — but fair game.
                </Text>
                <ItemInput
                  value={dislikes[0]}
                  onChangeText={(v) => setDislikes([v, dislikes[1], dislikes[2]])}
                  placeholder="e.g. Studying late"
                  onRemovePress={() => setDislikes(['', dislikes[1], dislikes[2]])}
                />
                <ItemInput
                  value={dislikes[1]}
                  onChangeText={(v) => setDislikes([dislikes[0], v, dislikes[2]])}
                  placeholder="e.g. Crowded buses"
                  onRemovePress={() => setDislikes([dislikes[0], '', dislikes[2]])}
                />
                <ItemInput
                  value={dislikes[2]}
                  onChangeText={(v) => setDislikes([dislikes[0], dislikes[1], v])}
                  placeholder="e.g. Rainy days"
                  onRemovePress={() => setDislikes([dislikes[0], dislikes[1], ''])}
                />
              </View>

              <View style={{ alignItems: 'center', width: '100%', marginTop: 12 }}>
                <TouchableOpacity
                  style={styles.entryPrimaryButton}
                  onPress={handleContinue}
                  activeOpacity={0.9}
                >
                  <Text style={styles.entryPrimaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
