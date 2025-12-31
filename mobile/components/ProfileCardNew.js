// mobile/components/ProfileCardNew.js
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/ProfileCardStylesNew';
import MoreAboutMeSheet from './MoreAboutMeSheet';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  if (typeof profile?.age === 'number' && profile.age > 0) return profile.age;
  if (typeof profile?.age === 'string' && profile.age.trim()) {
    const ageNum = parseInt(profile.age.trim(), 10);
    if (!isNaN(ageNum) && ageNum > 0) return ageNum;
  }

  if (profile?.date_of_birth) {
    try {
      const birthDate = new Date(profile.date_of_birth);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age > 0 && age < 150) return age;
      }
    } catch (e) {
      console.warn('Error calculating age from date_of_birth:', e);
    }
  }

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

const PhotoProgressBar = React.memo(function PhotoProgressBar({ count, activeIndex }) {
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
});

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ProfileCardNew({ profile, photos, onDetailsOpenChange }) {
  const safePhotos = useMemo(() => normalizePhotos(photos), [photos]);
  const hasPhotos = safePhotos.length > 0;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [moreAboutMeOpen, setMoreAboutMeOpen] = useState(false);

  const scrollRef = useRef(null);
  const isClosingRef = useRef(false);

  const chevronRotation = useRef(new Animated.Value(0)).current;
  const expansion = useRef(new Animated.Value(0)).current;

  const TOP_BAR_HEIGHT = 60;
  const BOTTOM_NAV_HEIGHT = 80;
  const EXPANDED_CARD_HEIGHT = SCREEN_HEIGHT - TOP_BAR_HEIGHT - BOTTOM_NAV_HEIGHT;

  const DEFAULT_CARD_HEIGHT = Math.min(
    (Dimensions.get('window').width - 32) * 1.6,
    SCREEN_HEIGHT * 0.78
  );

  const PHOTO_HEIGHT_EXPANDED = 500;
  const EXPAND_UPWARD_OFFSET = -20;
  const OVERLAY_DEADZONE = 120;

  // ✅ small cleanup: compute once (keeps your existing behavior)
  const backdropOpacity = useMemo(
    () =>
      expansion.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 1, 1],
      }),
    [expansion]
  );

  useEffect(() => {
    onDetailsOpenChange?.(moreOpen);
  
    Animated.parallel([
      Animated.timing(chevronRotation, {
        toValue: moreOpen ? 1 : 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(expansion, {
        toValue: moreOpen ? 1 : 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
    
      if (!moreOpen) {
        // If we didn't already animate-scroll to top, ensure it's at 0 now.
        if (!isClosingRef.current) {
          scrollRef.current?.scrollTo?.({ y: 0, animated: false });
        }
        isClosingRef.current = false;
        setScrollEnabled(false);
      } else {
        setScrollEnabled(true);
      }
    });
  }, [moreOpen, onDetailsOpenChange, chevronRotation, expansion]);
  
  useEffect(() => {
    setPhotoIndex(0);
    setMoreOpen(false);
    setScrollEnabled(false);
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    chevronRotation.setValue(0);
    expansion.setValue(0);
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentUri = hasPhotos ? safePhotos[photoIndex]?.uri : null;

  // ✅ small perf win: stable handlers
  const handleNextPhoto = useCallback(() => {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev + 1) % safePhotos.length);
  }, [hasPhotos, safePhotos.length]);

  const handlePrevPhoto = useCallback(() => {
    if (!hasPhotos) return;
    setPhotoIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  }, [hasPhotos, safePhotos.length]);

  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const cardScale = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });
  

  const cardHeight = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [DEFAULT_CARD_HEIGHT, EXPANDED_CARD_HEIGHT],
  });

  const cardTranslateY = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, EXPAND_UPWARD_OFFSET],
  });

  const photoHeight = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [DEFAULT_CARD_HEIGHT, PHOTO_HEIGHT_EXPANDED],
  });

  const closeMore = useCallback(() => {
    // freeze user scrolling immediately
    setScrollEnabled(false);
  
    // mark that this close path already initiated a scroll-to-top
    isClosingRef.current = true;
  
    // smooth scroll to top (prevents clamp/jump in photo)
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
  
    // start collapse on next frame so the scroll animation can begin cleanly
    requestAnimationFrame(() => setMoreOpen(false));
  }, []);
  
  const toggleMore = useCallback(() => {
    if (moreOpen) closeMore();
    else setMoreOpen(true);
  }, [moreOpen, closeMore]);
  
  // Profile data
  const academicYear = coalesce(profile?.academic_year);
  const locationDescription = coalesce(profile?.location_description);
  const graduationYear = profile?.graduation_year ? String(profile.graduation_year) : null;

  const displayName = coalesce(profile?.display_name, profile?.name, 'Your name');
  const firstName = getFirstName(displayName) || displayName;
  const age = getAge(profile);

  const hometown = coalesce(profile?.hometown);
  const languages = coalesce(profile?.languages);
  const height = profile?.height ? `${profile.height} cm` : null;
  const religiousBeliefs = coalesce(profile?.religious_beliefs);
  const politicalAffiliation = coalesce(profile?.political_affiliation);
  const ethnicity = coalesce(profile?.ethnicity);

  if (__DEV__) {
    console.log(
      'ProfileCardNew - age:',
      age,
      'profile.age:',
      profile?.age,
      'profile.date_of_birth:',
      profile?.date_of_birth
    );
  }

  const educationLevel = toTitleCase(coalesce(profile?.education_level, profile?.student_type));
  const yearLabel = coalesce(profile?.year_label, profile?.class_year_label, profile?.yearLabel, educationLevel);

  const bio = coalesce(profile?.bio);

  const mutualCount =
    typeof profile?.mutual_count === 'number'
      ? profile.mutual_count
      : typeof profile?.mutuals_count === 'number'
        ? profile.mutuals_count
        : typeof profile?.mutuals === 'number'
          ? profile.mutuals
          : null;

  // affiliations
  const affiliationsInfo = profile?.affiliations_info || [];
  const affiliations =
    affiliationsInfo.length > 0
      ? affiliationsInfo.map((a) => a.short_name || a.name).filter(Boolean)
      : (() => {
          const affiliationsRaw = profile?.affiliations || profile?.clubs || profile?.organizations || [];
          return Array.isArray(affiliationsRaw)
            ? affiliationsRaw.map((a) => (typeof a === 'object' ? a.name : String(a))).filter(Boolean)
            : normalizeList(affiliationsRaw);
        })();

  const dormInfo = profile?.dorm;
  const dormName = dormInfo ? dormInfo.short_name || dormInfo.name : null;

  const featuredAffiliationIds = profile?.featured_affiliations || profile?.featuredAffiliations || [];
  let featuredAffiliations = [];

  if (Array.isArray(featuredAffiliationIds) && featuredAffiliationIds.length > 0) {
    featuredAffiliations = featuredAffiliationIds
      .slice(0, 2)
      .map((featuredId) => {
        const normalizedFeatured = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
        const found = affiliationsInfo.find((aff) => {
          const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
          return affId === normalizedFeatured;
        });
        return found ? found.short_name || found.name : null;
      })
      .filter(Boolean);
  }

  if (featuredAffiliations.length === 0 && affiliations.length > 0) {
    featuredAffiliations = affiliations.slice(0, 2);
  }

  const schoolName = coalesce(profile?.school?.short_name, profile?.school?.name);
  const major = coalesce(profile?.major);
  const schoolAffiliations = normalizeList(
    profile?.school_affiliations || profile?.residential_house || profile?.college_affiliation
  );
  const interests = normalizeList(profile?.interests).slice(0, 8);

  const nonDormAffiliations = affiliationsInfo.filter((aff) => !aff.is_dorm);

  const buildAtPennSentence = () => {
    if (!academicYear) {
      const parts = [];
      if (major) parts.push(`studying ${major}`);
      if (dormName) parts.push(`lives in ${dormName}`);
      else if (locationDescription && locationDescription.toLowerCase().includes('off campus')) {
        parts.push('lives off campus');
      }
      return parts.length > 0 ? parts.join(', ') : null;
    }

    const parts = [];
    const classMap = {
      Freshman: 'Freshman',
      Sophomore: 'Sophomore',
      Junior: 'Junior',
      Senior: 'Senior',
      Graduate: 'Graduate student',
    };

    parts.push(classMap[academicYear] || academicYear);

    if (major) parts.push(`studying ${major}`);
    else parts.push('currently undecided');

    if (dormName) parts.push(`lives in ${dormName}`);
    else if (locationDescription && locationDescription.toLowerCase().includes('off campus')) {
      parts.push('lives off campus');
    }

    if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
    if (parts.length === 3) return `${parts[0]} ${parts[1]}, ${parts[2]}`;
    return parts.join(' ');
  };

  const atPennSentence = buildAtPennSentence();

  if (__DEV__) {
    console.log('ProfileCardNew - At Penn sentence:', {
      academicYear,
      major,
      dormName,
      atPennSentence,
      nonDormAffiliations: nonDormAffiliations.length,
    });
  }

  const schoolShortName = coalesce(profile?.school?.short_name, profile?.school_short_name);
  const gradYearShort = graduationYear ? `'${String(graduationYear).slice(-2)}` : null;
  const schoolAndYear =
    schoolShortName && gradYearShort ? `${schoolShortName} ${gradYearShort}` : schoolShortName || gradYearShort;

  const previewContextParts = [schoolAndYear, ...featuredAffiliations].filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.expandedBackdrop,
          {
            opacity: moreOpen ? backdropOpacity : 0,
          },
        ]}
        pointerEvents={moreOpen ? 'auto' : 'none'}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={closeMore}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          moreOpen && styles.cardExpanded,
          {
            height: cardHeight,
            transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            zIndex: moreOpen ? 1000 : 1,
            elevation: moreOpen ? 20 : 3,
          },
        ]}
      >
        <AnimatedScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.expandedScrollContent, !moreOpen && { paddingBottom: 0 }]}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
          bounces={moreOpen}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
        >
          {/* PHOTO AREA */}
          <Animated.View
  style={[
    styles.photoContainer,
    styles.photoContainerExpanded,
    styles.photoContainerHardware,
    { height: photoHeight },
  ]}
>
            <PhotoProgressBar count={safePhotos.length} activeIndex={photoIndex} />

            {currentUri ? (
              <Image source={{ uri: currentUri }} style={[styles.photo, styles.photoClipped]} resizeMode="cover" fadeDuration={0} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>Add a photo</Text>
              </View>
            )}

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

            {/* CAPTION OVERLAY (tight) */}
            <View style={styles.captionOverlay} pointerEvents="box-none">
              <LinearGradient
                colors={['rgba(0,0,0,0.00)', 'rgba(0,0,0,0.42)']}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />

              <Pressable onPress={toggleMore} style={styles.captionTapArea} hitSlop={6}>
                <Text style={styles.nameText}>
                  {firstName}
                  {age !== null && age !== undefined ? <Text style={styles.ageText}>, {age}</Text> : null}
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
                <Animated.Text style={[styles.moreChevronText, { transform: [{ rotate: chevronRotate }] }]}>
                  ⌃
                </Animated.Text>
              </Pressable>
            </View>
          </Animated.View>

          <View style={styles.expandedContent}>
            {/* ABOUT */}
            {(academicYear || major || dormName || hometown) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ABOUT</Text>

                {academicYear && major && (
                  <Text style={styles.aboutLine}>
                    {academicYear} studying {major}
                  </Text>
                )}

                {dormName && <Text style={styles.aboutLineSecondary}>Lives in {dormName}</Text>}

                {hometown && <Text style={styles.aboutLineSecondary}>From {hometown}</Text>}
              </View>
            )}

            <View style={styles.divider} />

            {/* ON CAMPUS */}
            {nonDormAffiliations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ON CAMPUS</Text>

                <View style={styles.inlineLine} pointerEvents="none">
                  {nonDormAffiliations.slice(0, 5).map((aff, idx) => {
                    const label = aff?.short_name || aff?.name || String(aff);
                    const key = aff?.id ?? `${label}-${idx}`;

                    return (
                      <React.Fragment key={`aff-${key}`}>
                        {idx > 0 ? <View style={styles.inlineDot} /> : null}
                        <Text style={styles.inlineItem} numberOfLines={1}>
                          {label}
                        </Text>
                      </React.Fragment>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* INTERESTS */}
            {interests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>INTERESTS</Text>
                <Text style={styles.inlineText} numberOfLines={2}>
                  {interests.slice(0, 8).join(' · ')}
                </Text>
              </View>
            )}

            <View style={{ height: 26 }} />
          </View>
        </AnimatedScrollView>
      </Animated.View>

      {/* Bottom Sheet (still here since your file includes it) */}
      <MoreAboutMeSheet
        visible={moreAboutMeOpen}
        onClose={() => setMoreAboutMeOpen(false)}
        height={height}
        languages={languages}
        religiousBeliefs={religiousBeliefs}
        politicalAffiliation={politicalAffiliation}
        ethnicity={ethnicity}
        sexuality={coalesce(profile?.sexuality)}
      />
    </>
  );
}
