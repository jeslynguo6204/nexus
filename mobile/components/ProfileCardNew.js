// mobile/components/ProfileCardNew.js
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/themeNEW';

const CARD_RADIUS = 26;

function normalizePhotos(photos) {
  const safe = Array.isArray(photos) ? photos : [];
  return safe
    .map((p) => {
      if (!p) return null;
      if (typeof p === 'string') return { key: p, uri: p };
      if (typeof p === 'object' && p.url) return { key: p.id || p.url, uri: p.url };
      return null;
    })
    .filter(Boolean);
}

function coalesce(...vals) {
  for (const v of vals) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim().length === 0) continue;
    return v;
  }
  return '';
}

function getFirstName(displayName) {
  const name = (displayName || '').trim();
  if (!name) return '';
  return name.split(/\s+/)[0];
}

function getAge(profile) {
  if (typeof profile?.age === 'number') return profile.age;
  if (typeof profile?.age === 'string' && profile.age.trim()) return profile.age.trim();
  return null;
}

function toTitleCase(s) {
  const str = (s || '').trim();
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeList(maybeList) {
  if (!maybeList) return [];
  if (Array.isArray(maybeList)) return maybeList.filter(Boolean).map(String);
  if (typeof maybeList === 'string') {
    return maybeList
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

function PhotoProgressBar({ count, activeIndex }) {
  if (!count || count <= 1) return null;

  return (
    <View style={styles.progressWrap} pointerEvents="none">
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: idx <= activeIndex ? '100%' : '0%' }]} />
        </View>
      ))}
    </View>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
}

function ChipList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>
        {items.map((it) => (
          <View key={`${title}-${it}`} style={styles.chip}>
            <Text style={styles.chipText}>{it}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProfileCardNew({ profile, photos, onLike, onPass }) {
  const safePhotos = useMemo(() => normalizePhotos(photos), [photos]);
  const hasPhotos = safePhotos.length > 0;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  const currentUri = hasPhotos ? safePhotos[photoIndex]?.uri : null;

  function handleNextPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev + 1) % safePhotos.length);
  }
  function handlePrevPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  }

  // --- Public “main card” fields ---
  const displayName = coalesce(profile?.display_name, profile?.name, 'Your name');
  const firstName = getFirstName(displayName) || displayName;

  const age = getAge(profile);

  const schoolName = coalesce(profile?.school?.short_name, profile?.school?.name);
  const gradYear = profile?.graduation_year ? `'${String(profile.graduation_year).slice(-2)}` : '';
  const major = coalesce(profile?.major);
  const bio = coalesce(profile?.bio);

  const educationLevel = toTitleCase(coalesce(profile?.education_level, profile?.student_type));

  // --- Expanded profile fields ---
  const affiliations = normalizeList(profile?.affiliations || profile?.clubs || profile?.organizations);
  const schoolAffiliations = normalizeList(
    profile?.school_affiliations || profile?.residential_house || profile?.college_affiliation
  );
  const interests = normalizeList(profile?.interests);

  const headerLine = [schoolName, gradYear].filter(Boolean).join(' ');
  const metaLine = [educationLevel, major].filter(Boolean).join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.photoContainer}>
        <PhotoProgressBar count={safePhotos.length} activeIndex={photoIndex} />

        {currentUri ? (
          <Image source={{ uri: currentUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Add a photo</Text>
          </View>
        )}

        {/* Tap zones (still for testing; we keep them) */}
        <TouchableOpacity style={styles.leftTapZone} onPress={handlePrevPhoto} activeOpacity={0.2} />
        <TouchableOpacity style={styles.rightTapZone} onPress={handleNextPhoto} activeOpacity={0.2} />

        {/* Bottom overlay (story caption) */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.74)']}
          style={styles.captionGradient}
          pointerEvents="box-none"
        >
          <View style={styles.handlePill} pointerEvents="none" />

          {/* Quick-test More button (center) */}
          <Pressable onPress={() => setMoreOpen(true)} style={styles.moreButtonCenter} hitSlop={10}>
            <Text style={styles.moreButtonText}>More</Text>
          </Pressable>

          <Text style={styles.nameText}>
            {firstName}
            {age ? <Text style={styles.ageText}>{`  ${age}`}</Text> : null}
          </Text>

          {!!headerLine && <Text style={styles.metaText}>{headerLine}</Text>}
          {!!metaLine && <Text style={styles.metaTextSecondary}>{metaLine}</Text>}

          {!!bio && (
            <Text style={styles.bioText} numberOfLines={2}>
              {bio}
            </Text>
          )}
        </LinearGradient>

        {/* Floating actions */}
        <View style={styles.floatingActions} pointerEvents="box-none">
          <Pressable
            onPress={onPass}
            style={({ pressed }) => [styles.floatingButton, pressed && styles.floatingButtonPressed]}
            hitSlop={10}
          >
            <Text style={styles.floatingIcon}>×</Text>
          </Pressable>

          <Pressable
            onPress={onLike}
            style={({ pressed }) => [
              styles.floatingButton,
              pressed && styles.floatingButtonPressed,
            ]}
            hitSlop={10}
          >
            <Text style={[styles.floatingIcon, { color: COLORS.accent }]}>♡</Text>
          </Pressable>
        </View>

        {/* Expanded profile (photo-backed background, unified scroll) */}
        <Modal
          visible={moreOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMoreOpen(false)}
        >
          <View style={styles.expandedRoot}>
            {/* Blurred photo background */}
            {currentUri ? (
              <Image
                source={{ uri: currentUri }}
                style={styles.expandedBgImage}
                blurRadius={28}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.expandedBgFallback} />
            )}

            {/* Soft wash to keep text readable + cohesive */}
            <LinearGradient
              colors={[
                'rgba(10,10,10,0.35)',
                'rgba(250,250,250,0.88)',
                'rgba(250,250,250,0.96)',
              ]}
              style={styles.expandedBgWash}
              pointerEvents="none"
            />

            {/* Close */}
            <Pressable
              onPress={() => setMoreOpen(false)}
              style={({ pressed }) => [styles.expandedClose, pressed && { opacity: 0.75 }]}
              hitSlop={10}
            >
              <Text style={styles.expandedCloseText}>×</Text>
            </Pressable>

            {/* One scroll view: hero + details scroll together */}
            <ScrollView
              style={styles.expandedScroll}
              contentContainerStyle={styles.expandedContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.expandedHero}>
                {currentUri ? (
                  <Image
                    source={{ uri: currentUri }}
                    style={styles.expandedHeroImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.expandedHeroPlaceholder} />
                )}

                {/* Hero readability fade */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.55)']}
                  style={styles.expandedHeroFade}
                  pointerEvents="none"
                />

                <View style={styles.expandedHeroText}>
                  <Text style={styles.expandedTitle}>
                    {firstName}
                    {age ? ` ${age}` : ''}
                  </Text>
                  {!!headerLine && <Text style={styles.expandedSub}>{headerLine}</Text>}
                  {!!metaLine && <Text style={styles.expandedSubMuted}>{metaLine}</Text>}
                </View>
              </View>

              {/* Translucent panel so the blur shows through */}
              <View style={styles.expandedPanel}>
                <DetailRow label="School" value={schoolName} />
                <DetailRow label="Year" value={profile?.graduation_year || ''} />
                <DetailRow label="Student" value={educationLevel} />
                <DetailRow label="Major" value={major} />

                {!!bio && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionTitle}>Bio</Text>
                    <Text style={styles.expandedParagraph}>{bio}</Text>
                  </View>
                )}

                <ChipList title="Affiliations" items={affiliations} />
                <ChipList title="School" items={schoolAffiliations} />
                <ChipList title="Interests" items={interests} />

                <View style={{ height: 28 }} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Base card ---
  card: {
    height: '100%',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  photoContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSubtle,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: COLORS.textDisabled,
    fontSize: 15,
    fontWeight: '700',
  },

  // Story progress bar
  progressWrap: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    zIndex: 20,
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.88)',
    width: '0%',
  },

  // Caption overlay
  captionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },
  handlePill: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 10,
  },

  // Quick test “More” button
  moreButtonCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -20 }],
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 999,
  },
  moreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  nameText: {
    color: COLORS.textInverse,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  ageText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 20,
    fontWeight: '800',
  },
  metaText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  metaTextSecondary: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  bioText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
    letterSpacing: 0.1,
  },

  // Floating actions
  floatingActions: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    zIndex: 40,
    elevation: 4,
    flexDirection: 'row',
    gap: 10,
  },
  floatingButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  floatingButtonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  floatingIcon: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: -1,
  },

  leftTapZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },
  rightTapZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    zIndex: 10,
  },

  // --- Expanded profile (photo-backed, scrolls as one) ---
  expandedRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  expandedBgImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    transform: [{ scale: 1.08 }],
  },
  expandedBgFallback: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.backgroundSubtle,
  },
  expandedBgWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  expandedClose: {
    position: 'absolute',
    top: 52,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
    zIndex: 50,
    elevation: 10,
  },
  expandedCloseText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: -2,
  },

  expandedScroll: {
    flex: 1,
  },
  expandedContent: {
    paddingBottom: 24,
  },

  expandedHero: {
    height: 420,
    width: '100%',
    overflow: 'hidden',
  },
  expandedHeroImage: {
    width: '100%',
    height: '100%',
  },
  expandedHeroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.backgroundSubtle,
  },
  expandedHeroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  expandedHeroText: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  expandedTitle: {
    color: COLORS.textInverse,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  expandedSub: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  expandedSubMuted: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Translucent panel = not sterile
  expandedPanel: {
    marginTop: -14,
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,252,248,0.78)', // slightly warm
    borderTopWidth: 1,
    borderColor: 'rgba(229,231,235,0.65)',
  },
  expandedParagraph: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textBody,
  },

  // Detail + chips (shared styles)
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(229,231,235,0.65)',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.1,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.65)',
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
});
