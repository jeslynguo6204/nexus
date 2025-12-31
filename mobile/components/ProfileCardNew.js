// mobile/components/ProfileCardNew.js
import React, { useMemo, useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/ProfileCardStylesNew';
import { COLORS } from '../styles/themeNEW';

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
  // First check if age is directly available
  if (typeof profile?.age === 'number' && profile.age > 0) return profile.age;
  if (typeof profile?.age === 'string' && profile.age.trim()) {
    const ageNum = parseInt(profile.age.trim(), 10);
    if (!isNaN(ageNum) && ageNum > 0) return ageNum;
  }
  
  // Fallback: calculate from date_of_birth if age is not available
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
        if (age > 0 && age < 150) { // Sanity check
          return age;
        }
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

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ProfileCardNew({ profile, photos, onDetailsOpenChange }) {
  const safePhotos = useMemo(() => normalizePhotos(photos), [photos]);
  const hasPhotos = safePhotos.length > 0;

  const [photoIndex, setPhotoIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const scrollRef = useRef(null);

  // Chevron rotation animation
  const chevronRotation = useRef(new Animated.Value(0)).current;
  // Expansion animation (0 collapsed -> 1 expanded)
  const expansion = useRef(new Animated.Value(0)).current;

  // Layout constants (keep same as your current intent)
  const TOP_BAR_HEIGHT = 60;
  const BOTTOM_NAV_HEIGHT = 80;
  const EXPANDED_CARD_HEIGHT = SCREEN_HEIGHT - TOP_BAR_HEIGHT - BOTTOM_NAV_HEIGHT;

  // Default card height from SwipeDeckNew
  const DEFAULT_CARD_HEIGHT = Math.min(
    (Dimensions.get('window').width - 32) * 1.6,
    SCREEN_HEIGHT * 0.78
  );

  // Photo height in expanded mode (scrolls because it sits inside ScrollView)
  const PHOTO_HEIGHT_EXPANDED = 500;

  // Slight upward movement when expanding
  const EXPAND_UPWARD_OFFSET = -20;

  // Prevent photo tap zones from stealing overlay/button taps
  const OVERLAY_DEADZONE = 120;

  useEffect(() => {
    // notify parent
    onDetailsOpenChange?.(moreOpen);

    // Disable scroll while animating (avoids jitter + weird gesture conflicts)
    setScrollEnabled(false);

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
        useNativeDriver: false, // height/translateY need JS driver
      }),
    ]).start(({ finished }) => {
      if (!finished) return;

      // When collapsing, snap back to top so the next expand starts clean
      if (!moreOpen) {
        scrollRef.current?.scrollTo?.({ y: 0, animated: false });
      }

      // Enable scroll only when expanded
      setScrollEnabled(moreOpen);
    });
  }, [moreOpen, onDetailsOpenChange, chevronRotation, expansion]);

  useEffect(() => {
    // when profile changes, reset everything cleanly
    setPhotoIndex(0);
    setMoreOpen(false);
    setScrollEnabled(false);
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
    // (Also reset animation values instantly to avoid transitional artifacts)
    chevronRotation.setValue(0);
    expansion.setValue(0);
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentUri = hasPhotos ? safePhotos[photoIndex]?.uri : null;

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

  // Animate card height and translateY
  const cardHeight = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [DEFAULT_CARD_HEIGHT, EXPANDED_CARD_HEIGHT],
  });

  const cardTranslateY = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [0, EXPAND_UPWARD_OFFSET],
  });

  // Animate photo height (collapsed: photo fills card; expanded: fixed photo height)
  const photoHeight = expansion.interpolate({
    inputRange: [0, 1],
    outputRange: [DEFAULT_CARD_HEIGHT, PHOTO_HEIGHT_EXPANDED],
  });

  const openMore = () => setMoreOpen(true);

 const closeMore = () => {
   // snap to top BEFORE collapse begins (prevents grey flash)
   scrollRef.current?.scrollTo?.({ y: 0, animated: false });
   setMoreOpen(false);
 };

const toggleMore = () => {
  if (moreOpen) closeMore();
  else openMore();
};


  // Profile data
  const academicYear = coalesce(profile?.academic_year);
  const locationDescription = coalesce(profile?.location_description);
  const graduationYear = profile?.graduation_year ? String(profile.graduation_year) : null;

  const displayName = coalesce(profile?.display_name, profile?.name, 'Your name');
  const firstName = getFirstName(displayName) || displayName;
  const age = getAge(profile);
  
  // New fields
  const hometown = coalesce(profile?.hometown);
  const languages = coalesce(profile?.languages);
  const height = profile?.height ? `${profile.height} cm` : null;
  const religiousBeliefs = coalesce(profile?.religious_beliefs);
  const politicalAffiliation = coalesce(profile?.political_affiliation);
  const ethnicity = coalesce(profile?.ethnicity);
  
  // Debug logging
  if (__DEV__) {
    console.log('ProfileCardNew - age:', age, 'profile.age:', profile?.age, 'profile.date_of_birth:', profile?.date_of_birth);
  }

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

  // Handle affiliations - prefer resolved affiliations_info, fallback to raw IDs
  const affiliationsInfo = profile?.affiliations_info || [];
  const affiliations = affiliationsInfo.length > 0
    ? affiliationsInfo.map(a => a.short_name || a.name).filter(Boolean)
    : (() => {
        const affiliationsRaw = profile?.affiliations || profile?.clubs || profile?.organizations || [];
        return Array.isArray(affiliationsRaw)
          ? affiliationsRaw.map((a) => (typeof a === 'object' ? a.name : String(a))).filter(Boolean)
          : normalizeList(affiliationsRaw);
      })();
  
  // Handle dorm
  const dormInfo = profile?.dorm;
  const dormName = dormInfo ? (dormInfo.short_name || dormInfo.name) : null;

  // Get featured affiliations - prefer from profile, fallback to first 2 affiliations
  const featuredAffiliationIds = profile?.featured_affiliations || profile?.featuredAffiliations || [];
  let featuredAffiliations = [];
  
  if (Array.isArray(featuredAffiliationIds) && featuredAffiliationIds.length > 0) {
    // Resolve featured affiliation IDs to names
    featuredAffiliations = featuredAffiliationIds
      .slice(0, 2) // Limit to 2
      .map(featuredId => {
        const normalizedFeatured = typeof featuredId === 'string' ? parseInt(featuredId, 10) : featuredId;
        const found = affiliationsInfo.find(aff => {
          const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
          return affId === normalizedFeatured;
        });
        return found ? (found.short_name || found.name) : null;
      })
      .filter(Boolean);
  }
  
  // Fallback to first 2 affiliations if no featured ones
  if (featuredAffiliations.length === 0 && affiliations.length > 0) {
    featuredAffiliations = affiliations.slice(0, 2);
  }

  const schoolName = coalesce(profile?.school?.short_name, profile?.school?.name);
  const major = coalesce(profile?.major);
  const schoolAffiliations = normalizeList(
    profile?.school_affiliations || profile?.residential_house || profile?.college_affiliation
  );
  const interests = normalizeList(profile?.interests);

  // Build preview context: school short_name + grad year, then featured affiliations
  const schoolShortName = coalesce(profile?.school?.short_name, profile?.school_short_name);
  const gradYearShort = graduationYear ? `'${String(graduationYear).slice(-2)}` : null;
  const schoolAndYear = schoolShortName && gradYearShort ? `${schoolShortName} ${gradYearShort}` : (schoolShortName || gradYearShort);
  const previewContextParts = [schoolAndYear, ...featuredAffiliations].filter(Boolean);

  return (
    <>
       {/* Backdrop: ALWAYS mounted, but hides immediately when collapsing */}
       <Animated.View
         style={[
           styles.expandedBackdrop,
           {
             opacity: moreOpen
               ? expansion.interpolate({
                   inputRange: [0, 0.3, 1],
                   outputRange: [0, 1, 1],
                 })
               : 0,
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
            transform: [{ translateY: cardTranslateY }],
            zIndex: moreOpen ? 1000 : 1,
            elevation: moreOpen ? 20 : 3,
          },
        ]}
      >
        {/* Single ScrollView tree: no mount/unmount jump */}
        <AnimatedScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.expandedScrollContent,
            !moreOpen && { paddingBottom: 0 },
          ]}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
          bounces={moreOpen}
          scrollEventThrottle={16}
          removeClippedSubviews={false}
        >
          {/* PHOTO AREA (always mounted) */}
          <Animated.View style={[styles.photoContainer, styles.photoContainerExpanded, { height: photoHeight }]}>
            <PhotoProgressBar count={safePhotos.length} activeIndex={photoIndex} />

            {currentUri ? (
              <Image
                source={{ uri: currentUri }}
                style={styles.photo}
                // Helps reduce flicker when switching photos quickly
                fadeDuration={120}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>Add a photo</Text>
              </View>
            )}

            {/* Tap zones for photo cycling */}
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
                style={({ pressed }) => [
                  styles.moreChevronBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                hitSlop={12}
              >
                <Animated.Text style={[styles.moreChevronText, { transform: [{ rotate: chevronRotate }] }]}>
                  ⌃
                </Animated.Text>
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* CONTENT BELOW PHOTO (always mounted; scroll only when expanded) */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20, backgroundColor: COLORS.surface }}>
            {!!academicYear && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Year</Text>
                <Text style={styles.expandedParagraph}>{academicYear}</Text>
              </View>
            )}

            {!!locationDescription && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Location</Text>
                <Text style={styles.expandedParagraph}>{locationDescription}</Text>
              </View>
            )}

            {!!graduationYear && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Graduation</Text>
                <Text style={styles.expandedParagraph}>{graduationYear}</Text>
              </View>
            )}

            {!!major && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Major</Text>
                <Text style={styles.expandedParagraph}>{major}</Text>
              </View>
            )}

            {!!schoolName && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>School</Text>
                <Text style={styles.expandedParagraph}>{schoolName}</Text>
              </View>
            )}

            {!!hometown && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Hometown</Text>
                <Text style={styles.expandedParagraph}>{hometown}</Text>
              </View>
            )}

            {!!languages && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <Text style={styles.expandedParagraph}>{languages}</Text>
              </View>
            )}

            {!!height && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Height</Text>
                <Text style={styles.expandedParagraph}>{height}</Text>
              </View>
            )}

            {!!religiousBeliefs && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Religious Beliefs</Text>
                <Text style={styles.expandedParagraph}>{religiousBeliefs}</Text>
              </View>
            )}

            {!!politicalAffiliation && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Political Affiliation</Text>
                <Text style={styles.expandedParagraph}>{politicalAffiliation}</Text>
              </View>
            )}

            {!!ethnicity && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Ethnicity</Text>
                <Text style={styles.expandedParagraph}>{ethnicity}</Text>
              </View>
            )}

            {!!dormName && (
              <View style={styles.expandedSection}>
                <Text style={styles.sectionTitle}>Dorm</Text>
                <Text style={styles.expandedParagraph}>{dormName}</Text>
              </View>
            )}

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
          </View>
        </AnimatedScrollView>
      </Animated.View>
    </>
  );
}
