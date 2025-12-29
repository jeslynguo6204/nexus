// mobile/components/ProfileCardNew.js
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/ProfileCardStylesNew';

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

function ChipList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.sheetSection}>
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

/**
 * Main card:
 * 1) Name + age
 * 2) Context line (year · featured/affils · mutuals)
 * 3) Bio (1 line)
 * Small button: top-right "i" pill (clickable) to open details.
 *
 * Expanded: bottom sheet
 */
export default function ProfileCardNew({ profile, photos, onDetailsOpenChange }) {
  const safePhotos = useMemo(() => normalizePhotos(photos), [photos]);
  const hasPhotos = safePhotos.length > 0;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    onDetailsOpenChange?.(moreOpen);
  }, [moreOpen, onDetailsOpenChange]);

  useEffect(() => {
    // if profile changes (new card), reset photo index
    setPhotoIndex(0);
  }, [profile?.id]);

  const currentUri = hasPhotos ? safePhotos[photoIndex]?.uri : null;

  const OVERLAY_DEADZONE = 150; // prevents photo tap zones from stealing overlay/button taps

  function handleNextPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev + 1) % safePhotos.length);
  }
  function handlePrevPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  }

  const displayName = coalesce(profile?.display_name, profile?.name, 'Your name');
  const firstName = getFirstName(displayName) || displayName;
  const age = getAge(profile);

  const educationLevel = toTitleCase(coalesce(profile?.education_level, profile?.student_type));
  const yearLabel = coalesce(
    profile?.year_label,
    profile?.class_year_label,
    profile?.yearLabel,
    educationLevel
  );

  const bio = coalesce(profile?.bio);

  const mutualCount =
    typeof profile?.mutual_count === 'number'
      ? profile.mutual_count
      : typeof profile?.mutuals_count === 'number'
        ? profile.mutuals_count
        : typeof profile?.mutuals === 'number'
          ? profile.mutuals
          : null;

  const mutualLabel = mutualCount !== null ? `🤝 ${mutualCount} mutuals` : '';

  const affiliations = normalizeList(profile?.affiliations || profile?.clubs || profile?.organizations);

  const featuredRaw = normalizeList(
    profile?.featured_affiliations || profile?.featuredAffiliations || profile?.featured
  ).slice(0, 2);

  // IMPORTANT: show something even if "featured" isn't wired yet
  const featuredAffiliations = featuredRaw.length ? featuredRaw : affiliations.slice(0, 2);

  const contextParts = [yearLabel, ...featuredAffiliations, mutualLabel].filter(Boolean);

  const schoolName = coalesce(profile?.school?.short_name, profile?.school?.name);
  const major = coalesce(profile?.major);
  const schoolAffiliations = normalizeList(
    profile?.school_affiliations || profile?.residential_house || profile?.college_affiliation
  );
  const interests = normalizeList(profile?.interests);

  const expandedMetaLine = [yearLabel, major].filter(Boolean).join(' · ');

  const openMore = () => setMoreOpen(true);
  const closeMore = () => setMoreOpen(false);

  return (
    <View style={styles.card}>
      {/* PHOTO AREA */}
      <View style={styles.photoContainer}>
        <PhotoProgressBar count={safePhotos.length} activeIndex={photoIndex} />

        {currentUri ? (
          <Image source={{ uri: currentUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Add a photo</Text>
          </View>
        )}

        {/* Tap zones: ONLY photo area */}
<TouchableOpacity
  style={[styles.leftTapZone, { bottom: OVERLAY_DEADZONE }]}
  onPress={handlePrevPhoto}
  activeOpacity={0.15}
/>
<TouchableOpacity
  style={[styles.rightTapZone, { bottom: OVERLAY_DEADZONE }]}
  onPress={handleNextPhoto}
  activeOpacity={0.15}
/>

        {/* CAPTION OVERLAY */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.captionGradient}
          pointerEvents="box-none"
        >
          <View style={styles.handlePill} pointerEvents="none" />

          {/* Caption tap area: open sheet */}
          <Pressable onPress={openMore} style={styles.captionTapArea} hitSlop={6}>
            <Text style={styles.nameText}>
              {firstName}
              {age ? <Text style={styles.ageText}>{`  ${age}`}</Text> : null}
            </Text>

            {!!contextParts.length && (
              <Text style={styles.contextLine} numberOfLines={1}>
                {contextParts.join(' · ')}
              </Text>
            )}

            {!!bio && (
              <Text style={styles.bioText} numberOfLines={1}>
                {bio}
              </Text>
            )}
          </Pressable>
          <Pressable
  onPress={openMore}
  style={({ pressed }) => [styles.moreChevronBtn, pressed && { transform: [{ scale: 0.98 }] }]}
  hitSlop={12}
>
  <Text style={styles.moreChevronText}>⌃</Text>
</Pressable>

        </LinearGradient>
      </View>

{/* EXPANDED — Tinder-style full profile (same card top, info scrolls below) */}
<Modal visible={moreOpen} transparent animationType="fade" onRequestClose={closeMore}>
  <View style={styles.expandedRoot}>
    {/* Backdrop */}
    <Pressable style={styles.expandedBackdrop} onPress={closeMore} />

    {/* Foreground "expanded card" */}
    <View style={styles.expandedCard}>
      {/* Close */}
      <Pressable onPress={closeMore} style={styles.expandedClose} hitSlop={10}>
        <Text style={styles.expandedCloseText}>×</Text>
      </Pressable>

      <ScrollView
        style={styles.expandedScroll}
        contentContainerStyle={styles.expandedContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO: same photo vibe as preview */}
        <View style={styles.expandedHero}>
          {currentUri ? (
            <Image source={{ uri: currentUri }} style={styles.expandedHeroImage} />
          ) : (
            <View style={styles.expandedHeroPlaceholder} />
          )}

          {/* Gradient + overlay text, like preview */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.62)']}
            style={styles.expandedHeroGradient}
            pointerEvents="none"
          />

          <View style={styles.expandedHeroText}>
            <Text style={styles.expandedTitle}>
              {firstName}
              {age ? ` ${age}` : ''}
            </Text>

            {!!contextParts.length && (
              <Text style={styles.expandedContextLine} numberOfLines={2}>
                {contextParts.join(' · ')}
              </Text>
            )}

            {!!bio && (
              <Text style={styles.expandedBioPreview} numberOfLines={2}>
                {bio}
              </Text>
            )}
          </View>
        </View>

        {/* BELOW: all the extra info */}
        <View style={styles.expandedBody}>
          {!!bio && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.expandedParagraph}>{bio}</Text>
            </View>
          )}

          {/* If you have these */}
          <ChipList title="Featured" items={featuredRaw} />
          <ChipList title="Affiliations" items={affiliations} />
          <ChipList title="School" items={schoolAffiliations} />
          <ChipList title="Interests" items={interests} />

          <View style={{ height: 28 }} />
        </View>
      </ScrollView>
    </View>
  </View>
</Modal>
    </View>
  );
}
