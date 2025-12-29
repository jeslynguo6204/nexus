// mobile/components/ProfileCardNew.js
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/ProfileCardStylesNew';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

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
  
  // Chevron rotation animation
  const chevronRotation = useRef(new Animated.Value(0)).current;
  // Card expansion animation
  const expansionHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onDetailsOpenChange?.(moreOpen);
    
    // Smooth, premium animations with easing
    Animated.parallel([
      Animated.timing(chevronRotation, {
        toValue: moreOpen ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expansionHeight, {
        toValue: moreOpen ? 1 : 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // height/position animations can't use native driver
      }),
    ]).start();
  }, [moreOpen, onDetailsOpenChange, chevronRotation, expansionHeight]);

  useEffect(() => {
    // if profile changes (new card), reset photo index and close expansion
    setPhotoIndex(0);
    setMoreOpen(false);
  }, [profile?.id]);

  const currentUri = hasPhotos ? safePhotos[photoIndex]?.uri : null;
  
  // When expanded, card should fill screen (minus top bar and bottom nav)
  // Top bar is ~60px, bottom nav is ~80px, so we use most of screen
  const TOP_BAR_HEIGHT = 60;
  const BOTTOM_NAV_HEIGHT = 80;
  const EXPANDED_CARD_HEIGHT = SCREEN_HEIGHT - TOP_BAR_HEIGHT - BOTTOM_NAV_HEIGHT;
  const PHOTO_HEIGHT_EXPANDED = 500; // Photo height when expanded (will scroll with content)
  // Default card height from SwipeDeckNew
  const DEFAULT_CARD_HEIGHT = Math.min((Dimensions.get('window').width - 32) * 1.6, SCREEN_HEIGHT * 0.78);
  
  // Calculate how much to move up when expanding (slight upward movement)
  const EXPAND_UPWARD_OFFSET = -20; // Move up 20px when expanding
  
  const OVERLAY_DEADZONE = 120; // prevents photo tap zones from stealing overlay/button taps

  function handleNextPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev + 1) % safePhotos.length);
  }
  function handlePrevPhoto() {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  }

  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Card height - use animated value for smooth transition
  // Note: We'll handle the actual height in the style prop to avoid string/number interpolation issues

  // Get profile data
  const academicYear = coalesce(profile?.academic_year);
  const locationDescription = coalesce(profile?.location_description);
  const graduationYear = profile?.graduation_year ? String(profile.graduation_year) : null;

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

  // Handle affiliations - could be array of IDs or array of strings
  const affiliationsRaw = profile?.affiliations || profile?.clubs || profile?.organizations || [];
  const affiliations = Array.isArray(affiliationsRaw) 
    ? affiliationsRaw.map(a => typeof a === 'object' ? a.name : String(a)).filter(Boolean)
    : normalizeList(affiliationsRaw);

  const featuredRaw = normalizeList(
    profile?.featured_affiliations || profile?.featuredAffiliations || profile?.featured
  ).slice(0, 2);

  // IMPORTANT: show something even if "featured" isn't wired yet
  const featuredAffiliations = featuredRaw.length ? featuredRaw : affiliations.slice(0, 2);

  // Build context line for preview: grad year + up to 2 featured affiliations + mutuals chip
  const gradYearShort = graduationYear ? `'${String(graduationYear).slice(-2)}` : null;
  const previewContextParts = [gradYearShort, ...featuredAffiliations].filter(Boolean);
  
  // Mutuals will be rendered as a separate chip component

  const schoolName = coalesce(profile?.school?.short_name, profile?.school?.name);
  const major = coalesce(profile?.major);
  const schoolAffiliations = normalizeList(
    profile?.school_affiliations || profile?.residential_house || profile?.college_affiliation
  );
  const interests = normalizeList(profile?.interests);

  const expandedMetaLine = [yearLabel, major].filter(Boolean).join(' · ');

  const toggleMore = () => setMoreOpen((prev) => !prev);

  return (
    <>
      {/* Backdrop when expanded */}
      {moreOpen && (
        <Animated.View
          style={[
            styles.expandedBackdrop,
            {
              opacity: expansionHeight,
            },
          ]}
          pointerEvents={moreOpen ? 'auto' : 'none'}
        >
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={toggleMore}
          />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.card,
          moreOpen && styles.cardExpanded,
          {
            height: expansionHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [
                DEFAULT_CARD_HEIGHT, // Normal card height
                EXPANDED_CARD_HEIGHT
              ],
            }),
            // Smooth upward movement when expanding
            transform: [
              {
                translateY: expansionHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, EXPAND_UPWARD_OFFSET],
                }),
              },
            ],
            zIndex: moreOpen ? 1000 : 1,
            elevation: moreOpen ? 20 : 3,
          },
        ]}
      >
      {/* PHOTO AREA - same in both modes, just different height */}
      <Animated.View
        style={[
          styles.photoContainer,
          {
            height: expansionHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [
                DEFAULT_CARD_HEIGHT, // Photo fills card when collapsed
                PHOTO_HEIGHT_EXPANDED // Fixed height when expanded
              ],
            }),
          },
          moreOpen && styles.photoContainerExpanded,
        ]}
      >
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

              {/* Caption tap area: toggle expansion */}
              <Pressable onPress={toggleMore} style={styles.captionTapArea} hitSlop={6}>
                <Text style={styles.nameText}>
                  {firstName}
                  {age ? <Text style={styles.ageText}>{`  ${age}`}</Text> : null}
                </Text>

                <View style={styles.contextLineContainer}>
                  {!!previewContextParts.length && (
                    <Text style={styles.contextLine} numberOfLines={1}>
                      {previewContextParts.join(' · ')}
                    </Text>
                  )}
                  {mutualCount !== null && mutualCount > 0 && (
                    <View style={styles.mutualsChip}>
                      <Text style={styles.mutualsChipText}>
                        {mutualCount} mutual{mutualCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bio in overlay */}
                {!!bio && (
                  <Text style={styles.bioText} numberOfLines={moreOpen ? 3 : 2}>
                    {bio}
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={toggleMore}
                style={({ pressed }) => [styles.moreChevronBtn, pressed && { transform: [{ scale: 0.98 }] }]}
                hitSlop={12}
              >
                <Animated.Text
                  style={[
                    styles.moreChevronText,
                    { transform: [{ rotate: chevronRotate }] },
                  ]}
                >
                  ⌃
                </Animated.Text>
              </Pressable>
            </LinearGradient>
      </Animated.View>

      {/* EXPANDABLE CONTENT - appears below photo when expanded */}
      <Animated.View
        style={[
          styles.expandedContent,
          {
            height: expansionHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, EXPANDED_CARD_HEIGHT - PHOTO_HEIGHT_EXPANDED],
            }),
            opacity: expansionHeight,
            overflow: 'hidden',
          },
        ]}
        pointerEvents={moreOpen ? 'auto' : 'none'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.expandedScrollContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={moreOpen}
          bounces={true}
          scrollEventThrottle={16}
          directionalLockEnabled={false}
          nestedScrollEnabled={false}
        >
            {/* CONTENT BELOW PHOTO - scrolls with photo */}
          {/* Academic Year */}
          {!!academicYear && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Year</Text>
              <Text style={styles.expandedParagraph}>{academicYear}</Text>
            </View>
          )}

          {/* Location */}
          {!!locationDescription && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.expandedParagraph}>{locationDescription}</Text>
            </View>
          )}

          {/* Graduation Year */}
          {!!graduationYear && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Graduation</Text>
              <Text style={styles.expandedParagraph}>{graduationYear}</Text>
            </View>
          )}

          {/* Major */}
          {!!major && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Major</Text>
              <Text style={styles.expandedParagraph}>{major}</Text>
            </View>
          )}

          {/* School */}
          {!!schoolName && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>School</Text>
              <Text style={styles.expandedParagraph}>{schoolName}</Text>
            </View>
          )}

          {/* Featured affiliations (if any) */}
          {featuredRaw.length > 0 && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <View style={styles.chipWrap}>
                {featuredRaw.map((item) => (
                  <View key={`featured-${item}`} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* All affiliations */}
          {affiliations.length > 0 && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Affiliations</Text>
              <View style={styles.chipWrap}>
                {affiliations.map((item) => (
                  <View key={`affil-${item}`} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* School/residential affiliations */}
          {schoolAffiliations.length > 0 && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>School</Text>
              <View style={styles.chipWrap}>
                {schoolAffiliations.map((item) => (
                  <View key={`school-${item}`} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Interests */}
          {interests.length > 0 && (
            <View style={styles.expandedSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.chipWrap}>
                {interests.map((item) => (
                  <View key={`interest-${item}`} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
    </Animated.View>
    </>
  );
}
