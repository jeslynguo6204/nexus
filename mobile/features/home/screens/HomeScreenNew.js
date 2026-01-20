// mobile/screens/HomeScreenNew.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SwipeDeckNew from '../components/SwipeDeckNew';
import { getFeedProfiles } from '../../../api/feedAPI';
import { getMyProfile } from '../../../api/profileAPI';
import styles from '../../../styles/HomeStylesNew';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function HomeScreenNew() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myUserId, setMyUserId] = useState(null);

  const [scope, setScope] = useState('school'); // school | league | area
  const [mode, setMode] = useState('romantic'); // romantic | platonic

  // Mode menu (popover)
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const modeChipRef = useRef(null);

  const modeGlyph = mode === 'romantic' ? '♡' : '⟡';

  const POPOVER_W = 200;
  const POPOVER_H = 150;
  const EDGE = 12;

  const openModeMenu = () => {
    requestAnimationFrame(() => {
      if (!modeChipRef.current?.measureInWindow) {
        setModeMenuOpen(true);
        return;
      }

      modeChipRef.current.measureInWindow((x, y, w, h) => {
        const { width: winW, height: winH } = Dimensions.get('window');

        // Align popover right edge with chip right edge
        let left = x + w - POPOVER_W;
        let top = y + h + 8;

        // Clamp inside visible area (respect safe areas)
        left = clamp(left, EDGE, winW - POPOVER_W - EDGE);
        top = clamp(top, insets.top + EDGE, winH - POPOVER_H - EDGE);

        setPopoverPos({ top, left });
        setModeMenuOpen(true);
      });
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not signed in');

        // Fetch both my profile and feed profiles
        const [myProfile, fetchedProfiles] = await Promise.all([
          getMyProfile(token),
          getFeedProfiles(token)
        ]);
        
        setMyUserId(myProfile?.user_id);
        setProfiles(Array.isArray(fetchedProfiles) ? fetchedProfiles : []);
        setCurrentIndex(0);
      } catch (e) {
        console.warn(e);
        Alert.alert('Error', String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function moveToNextCard() {
    setCurrentIndex((prev) => prev + 1);
  }

  async function handleSwipeRight(profile) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');
      console.log(`✅ Profile ${myUserId} LIKED profile ${profile?.user_id}`);
      // moveToNextCard is handled by onNext callback from SwipeDeckNew
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', String(e.message || e));
    }
  }

  async function handleSwipeLeft(profile) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not signed in');
      console.log(`⏭️  Profile ${myUserId} PASSED ON profile ${profile?.user_id}`);
      // moveToNextCard is handled by onNext callback from SwipeDeckNew
    } catch (e) {
      console.warn(e);
      Alert.alert('Error', String(e.message || e));
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const current = profiles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.brandMark} hitSlop={10}>
          <Text style={styles.brandMarkText}>6°</Text>
        </Pressable>

        <View style={styles.centerSlot}>
          <View style={styles.segmented}>
            <Pressable
              onPress={() => setScope('school')}
              style={[styles.segment, scope === 'school' && styles.segmentActive]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, scope === 'school' && styles.segmentTextActive]}>
                Penn
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setScope('league')}
              style={[styles.segment, scope === 'league' && styles.segmentActive]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, scope === 'league' && styles.segmentTextActive]}>
                Ivy League
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setScope('area')}
              style={[styles.segment, scope === 'area' && styles.segmentActive]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, scope === 'area' && styles.segmentTextActive]}>
                Philadelphia
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Glyph-only mode chip */}
        <Pressable
          ref={modeChipRef}
          onPress={openModeMenu}
          style={styles.modeGlyphChip}
          hitSlop={10}
        >
          <Text style={styles.modeGlyph}>{modeGlyph}</Text>
        </Pressable>
      </View>

      {/* Mode popover */}
      <Modal
        visible={modeMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModeMenuOpen(false)}
      >
        <Pressable style={styles.popoverOverlay} onPress={() => setModeMenuOpen(false)}>
          <Pressable
            onPress={() => {}}
            style={[
              styles.modePopover,
              { width: POPOVER_W, top: popoverPos.top, left: popoverPos.left },
            ]}
          >
            <Text style={styles.popoverTitle}>Mode</Text>

            <Pressable
              onPress={() => {
                setMode('romantic');
                setModeMenuOpen(false);
              }}
              style={[styles.popoverRow, mode === 'romantic' && styles.popoverRowActive]}
            >
              <Text
                style={[
                  styles.popoverRowGlyph,
                  mode === 'romantic' && styles.popoverRowGlyphActive,
                ]}
              >
                ♡
              </Text>
              <Text
                style={[
                  styles.popoverRowText,
                  mode === 'romantic' && styles.popoverRowTextActive,
                ]}
              >
                Romantic
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode('platonic');
                setModeMenuOpen(false);
              }}
              style={[styles.popoverRow, mode === 'platonic' && styles.popoverRowActive]}
            >
              <Text
                style={[
                  styles.popoverRowGlyph,
                  mode === 'platonic' && styles.popoverRowGlyphActive,
                ]}
              >
                ⟡
              </Text>
              <Text
                style={[
                  styles.popoverRowText,
                  mode === 'platonic' && styles.popoverRowTextActive,
                ]}
              >
                Platonic
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.content}>
        {current ? (
          <SwipeDeckNew
            profiles={profiles}
            currentIndex={currentIndex}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onNext={moveToNextCard}
          />
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                That&apos;s all for now!{'\n'}Check back later for new profiles.
              </Text>
              <Text style={styles.emptySub}>Six Degrees</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
