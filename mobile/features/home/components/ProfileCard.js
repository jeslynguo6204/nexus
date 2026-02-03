// mobile/components/ProfileCard.js
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
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../../styles/themeNEW';
import styles from '../../../styles/ProfileCardStyles';
import MoreAboutMeSheet from './MoreAboutMeSheet';
import BlockReportSheet from './BlockReportSheet';
import { trackPhotoView } from '../../../api/photosAPI';
import {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getMutualFriends,
} from '../../../api/friendsAPI';
import { getIdToken } from '../../../auth/tokens';

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

function normalizeIdArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((id) => {
      if (id === null || id === undefined) return null;
      if (typeof id === 'number') return id;
      if (typeof id === 'string') {
        const n = parseInt(id, 10);
        return Number.isNaN(n) ? null : n;
      }
      return null;
    })
    .filter((x) => x !== null && Number.isInteger(x) && x > 0);
}

function buildFriendContextLine(friend) {
  const school = friend?.school_short_name || friend?.school_name || '';
  const yr = friend?.graduation_year != null ? `'${String(friend.graduation_year).slice(-2)}` : null;
  const schoolAndYear = [school, yr].filter(Boolean).join(' ');
  const affs = Array.isArray(friend?.featured_affiliation_short_names)
    ? friend.featured_affiliation_short_names.slice(0, 2).filter(Boolean)
    : [];
  const parts = [schoolAndYear, ...affs].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
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

export default function ProfileCard({
  profile,
  photos,
  onDetailsOpenChange,
  photoIndex: controlledPhotoIndex,
  onPhotoIndexChange,
  isOwnProfile = false,
  disableUpwardExpansion = false,
}) {
  const safePhotos = useMemo(() => normalizePhotos(photos), [photos]);
  const hasPhotos = safePhotos.length > 0;

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledPhotoIndex !== undefined && onPhotoIndexChange !== undefined;
  const [internalPhotoIndex, setInternalPhotoIndex] = useState(0);
  const photoIndex = isControlled ? controlledPhotoIndex : internalPhotoIndex;
  const setPhotoIndex = isControlled ? onPhotoIndexChange : setInternalPhotoIndex;
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [moreAboutMeOpen, setMoreAboutMeOpen] = useState(false);
  const [blockReportSheetOpen, setBlockReportSheetOpen] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(profile?.friendship_status || 'none');
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [mutualsVisible, setMutualsVisible] = useState(false);
  const [mutualsLoading, setMutualsLoading] = useState(false);
  const [mutualFriends, setMutualFriends] = useState([]);

  const insets = useSafeAreaInsets();
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
    setMutualsVisible(false);
    setMutualFriends([]);
    setMutualsLoading(false);
  }, [profile?.user_id || profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track photo views (skip when previewing own profile)
  useEffect(() => {
    if (isOwnProfile) return;
    const trackView = async () => {
      if (safePhotos[photoIndex]?.id) {
        try {
          const token = await getIdToken();
          if (token) {
            await trackPhotoView(token, safePhotos[photoIndex].id);
          }
        } catch (error) {
          // Fail silently
          console.warn('Failed to track photo view:', error);
        }
      }
    };
    
    trackView();
  }, [isOwnProfile, photoIndex, safePhotos]);

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
    outputRange: [0, (isOwnProfile || disableUpwardExpansion) ? 0 : EXPAND_UPWARD_OFFSET],
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

  // Update friendship status when profile changes
  useEffect(() => {
    if (profile?.friendship_status) {
      setFriendshipStatus(profile.friendship_status);
    }
  }, [profile?.friendship_status]);

  // Friend button handlers
  const handleFriendAction = useCallback(async () => {
    if (friendActionLoading || isOwnProfile) return;

    const userId = profile?.user_id || profile?.id;
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    const name = getFirstName(profile?.display_name || profile?.name) || 'this person';

    if (friendshipStatus === 'friends') {
      Alert.alert(
        'Unfriend?',
        `Do you want to unfriend ${name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfriend',
            style: 'destructive',
            onPress: async () => {
              try {
                setFriendActionLoading(true);
                const token = await getIdToken();
                if (!token) return;
                await removeFriend(token, userId);
                setFriendshipStatus('none');
              } catch (error) {
                console.error('Friend action error:', error);
              } finally {
                setFriendActionLoading(false);
              }
            },
          },
        ]
      );
      return;
    }

    try {
      setFriendActionLoading(true);
      const token = await getIdToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }

      if (friendshipStatus === 'none') {
        await sendFriendRequest(token, userId);
        setFriendshipStatus('pending_sent');
      } else if (friendshipStatus === 'pending_sent') {
        await cancelFriendRequest(token, userId);
        setFriendshipStatus('none');
      } else if (friendshipStatus === 'pending_received') {
        await acceptFriendRequest(token, userId);
        setFriendshipStatus('friends');
      }
    } catch (error) {
      console.error('Friend action error:', error);
    } finally {
      setFriendActionLoading(false);
    }
  }, [friendshipStatus, friendActionLoading, profile, isOwnProfile]);

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

  const educationLevel = toTitleCase(coalesce(profile?.education_level, profile?.student_type));
  const yearLabel = coalesce(profile?.year_label, profile?.class_year_label, profile?.yearLabel, educationLevel);

  const bio = coalesce(profile?.bio);

  const rawMutual =
    profile?.mutual_count ?? profile?.mutuals_count ?? profile?.mutuals ?? profile?.mutualCount ?? profile?.mutualsCount;
  const mutualCount = (() => {
    if (rawMutual == null) return null;
    if (typeof rawMutual === 'number') return Number.isFinite(rawMutual) ? rawMutual : null;
    if (typeof rawMutual === 'string') {
      const n = parseInt(rawMutual, 10);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  })();
  if (__DEV__ && !isOwnProfile && profile?.user_id) {
    console.log('[ProfileCard] mutual_count debug', { userId: profile.user_id, rawMutual, mutualCount });
  }

  const openMutuals = useCallback(async () => {
    if (isOwnProfile) return;
    if (!mutualCount || mutualCount <= 0) return;

    const userId = profile?.user_id || profile?.id;
    if (!userId) return;

    setMutualsVisible(true);

    if (mutualFriends.length > 0) return;

    try {
      setMutualsLoading(true);
      const token = await getIdToken();
      if (!token) return;
      const data = await getMutualFriends(token, userId);
      setMutualFriends(Array.isArray(data?.mutuals) ? data.mutuals : []);
    } catch (error) {
      console.error('Failed to load mutual friends:', error);
      Alert.alert('Error', 'Failed to load mutual friends. Please try again.');
    } finally {
      setMutualsLoading(false);
    }
  }, [isOwnProfile, mutualCount, mutualFriends.length, profile]);

  const closeMutuals = useCallback(() => setMutualsVisible(false), []);

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

  // Get featured affiliations in the order they were selected (preserve order from backend)
  const featuredAffiliationIds = profile?.featured_affiliations || profile?.featuredAffiliations || [];
  let featuredAffiliations = [];

  // Only process featured affiliations if they exist and have items
  // If empty array or no items, featuredAffiliations will remain empty (no fallback)
  if (Array.isArray(featuredAffiliationIds) && featuredAffiliationIds.length > 0) {
    // Map in order to preserve selection order - first selected appears first
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

  const schoolName = coalesce(profile?.school?.short_name, profile?.school?.name);
  const major = coalesce(profile?.major);
  const schoolAffiliations = normalizeList(
    profile?.school_affiliations || profile?.residential_house || profile?.college_affiliation
  );
  const interests = normalizeList(profile?.interests).slice(0, 8);
  const likes = normalizeList(profile?.likes).slice(0, 3);
  const dislikes = normalizeList(profile?.dislikes).slice(0, 3);

  // Filter out dorms
  const allNonDormAffiliations = affiliationsInfo.filter((aff) => !aff.is_dorm);
  
  // Get featured affiliation IDs in order (normalized)
  const featuredIds = (featuredAffiliationIds || [])
    .slice(0, 2)
    .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
    .filter(id => !isNaN(id) && id > 0);
  
  // Create a map of all affiliations by ID for quick lookup
  const affMap = new Map();
  allNonDormAffiliations.forEach(aff => {
    const affId = typeof aff.id === 'string' ? parseInt(aff.id, 10) : aff.id;
    affMap.set(affId, aff);
  });
  
  // Get the order from profile.affiliations array (this is the order from the profile editor)
  const profileAffiliationIds = normalizeIdArray(profile?.affiliations || []);
  const featuredIdsSet = new Set(featuredIds);
  
  // Get featured affiliations in selection order (first selected first, second selected second)
  const featuredAffils = featuredIds
    .map(id => affMap.get(id))
    .filter(Boolean); // Remove any not found
  
  // Get other affiliations (not featured) in the order they appear in profile.affiliations
  const otherAffils = profileAffiliationIds
    .filter(affId => !featuredIdsSet.has(affId))
    .map(affId => affMap.get(affId))
    .filter(Boolean); // Remove any not found
  
  // Combine: featured affiliations first (in selection order), then the rest (in profile order)
  const nonDormAffiliations = [...featuredAffils, ...otherAffils];

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
          contentContainerStyle={[
            styles.expandedScrollContent,
            !moreOpen && { paddingBottom: 0 },
            moreOpen && !isOwnProfile && { paddingBottom: 36 },
            isOwnProfile && moreOpen && { paddingBottom: 8, flexGrow: 0 },
          ]}
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

{/* Friend status chip: photo-safe states — Add Friend (gray), Requested (style-guide blue), Accept/Friends (dark blue); ~80% opacity */}
{!isOwnProfile && (() => {
  const FILL = 0.8;
  const DARK_BLUE = `rgba(15, 59, 97, ${FILL})`;
  const GRAY_ADD = `rgba(156, 163, 175, ${FILL})`;
  const PRIMARY_BLUE = `rgba(37, 99, 235, ${FILL})`;

  const status = friendshipStatus;
  const isFriends = status === 'friends';
  const isPendingSent = status === 'pending_sent';
  const isPendingReceived = status === 'pending_received';

  const label =
    isFriends ? 'Friends' :
    isPendingSent ? 'Requested' :
    isPendingReceived ? 'Accept' :
    'Add Friend';

  const CHIP_HEIGHT = 30;
  const CHIP_WIDTH = 100;
  const chipStyle = {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 35,
    height: CHIP_HEIGHT,
    width: CHIP_WIDTH,
    paddingHorizontal: 10,
    borderRadius: CHIP_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: isFriends || isPendingReceived
      ? DARK_BLUE
      : isPendingSent
        ? PRIMARY_BLUE
        : GRAY_ADD,
  };

  const textStyle = {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleFriendAction}
      disabled={friendActionLoading}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={chipStyle}
    >
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
})()}


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
                  {(!!previewContextParts.length || (!isOwnProfile && mutualCount !== null && mutualCount > 0)) && (
                    <View style={styles.contextLineRow}>
                      {!!previewContextParts.length && (
                        <Text style={styles.contextLine} numberOfLines={1}>
                          {previewContextParts.join(' · ')}
                        </Text>
                      )}
                      {!!previewContextParts.length && !isOwnProfile && mutualCount !== null && mutualCount > 0 && (
                        <Text style={styles.contextLine}> · </Text>
                      )}
                      {!isOwnProfile && mutualCount !== null && mutualCount > 0 && (
                        <Pressable
                          onPress={openMutuals}
                          style={styles.contextLineMutualsWrap}
                          hitSlop={6}
                        >
                          <Text style={styles.contextLineBold}>{mutualCount}+ </Text>
                          <FontAwesome5
                            name="user-friends"
                            size={11}
                            color="white"
                            style={styles.contextLineMutualsIcon}
                          />
                        </Pressable>
                      )}
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

          <View style={[styles.expandedContent, isOwnProfile && { paddingBottom: 8 }]}>
            {/* ABOUT section (with heading) */}
            {((academicYear && major) || dormName || locationDescription || hometown) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ABOUT</Text>

                {academicYear && major && (
                  <Text style={styles.aboutLine}>
                    {academicYear} studying {major}
                  </Text>
                )}

                {dormName ? (
                  <Text style={styles.aboutLineSecondary}>Lives in {dormName}</Text>
                ) : locationDescription ? (
                  <Text style={styles.aboutLineSecondary}>Lives in {locationDescription}</Text>
                ) : null}

                {hometown && (
                  <Text style={styles.aboutLineSecondary}>From {hometown}</Text>
                )}
              </View>
            )}

            {((academicYear && major) || dormName || locationDescription || hometown) && (
              <View style={styles.divider} />
            )}

            {/* Likes & Dislikes */}
            {(likes.length > 0 || dislikes.length > 0) && (
              <View style={styles.section}>
                {likes.length > 0 && (
                  <>
                    <Text style={styles.sectionLabel}>LIKES</Text>
                    <View style={styles.inlineLine} pointerEvents="none">
                      {likes.map((like, idx) => (
                        <React.Fragment key={`like-${idx}`}>
                          {idx > 0 ? <View style={styles.inlineDot} /> : null}
                          <Text style={styles.inlineItem} numberOfLines={1}>
                            {like}
                          </Text>
                        </React.Fragment>
                      ))}
                    </View>
                  </>
                )}

                {dislikes.length > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.sectionLabel}>DISLIKES</Text>
                    <View style={styles.inlineLine} pointerEvents="none">
                      {dislikes.map((dislike, idx) => (
                        <React.Fragment key={`dislike-${idx}`}>
                          {idx > 0 ? <View style={styles.inlineDot} /> : null}
                          <Text style={styles.inlineItem} numberOfLines={1}>
                            {dislike}
                          </Text>
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
                )}
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
                <View style={styles.inlineLine} pointerEvents="none">
                  {interests.slice(0, 8).map((interest, idx) => (
                    <React.Fragment key={`interest-${idx}`}>
                      {idx > 0 ? <View style={styles.inlineDot} /> : null}
                      <Text style={styles.inlineItem} numberOfLines={1}>
                        {interest}
                      </Text>
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: isOwnProfile ? 0 : 14 }} />
          </View>
        </AnimatedScrollView>
      </Animated.View>

      <Modal visible={mutualsVisible} animationType="slide" onRequestClose={closeMutuals}>
        <View style={{ flex: 1, backgroundColor: COLORS.surface }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: insets.top + 8,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.divider,
            }}
          >
            <TouchableOpacity onPress={closeMutuals} hitSlop={12} style={{ padding: 8, marginLeft: -8 }}>
              <FontAwesome name="chevron-left" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '700',
                color: COLORS.textPrimary,
              }}
            >
              Mutual Friends
            </Text>
            <View style={{ width: 38 }} />
          </View>

          {mutualsLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.textPrimary} />
            </View>
          ) : mutualFriends.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 16, color: COLORS.textMuted }}>No mutual friends yet</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
              showsVerticalScrollIndicator={false}
            >
              {mutualFriends.map((friend) => {
                const subtitle = buildFriendContextLine(friend);
                return (
                  <View
                    key={friend.friend_id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.divider,
                    }}
                  >
                    {friend.avatar_url ? (
                      <Image
                        source={{ uri: friend.avatar_url }}
                        style={{ width: 52, height: 52, borderRadius: 26, marginRight: 14 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 26,
                          backgroundColor: COLORS.backgroundSubtle,
                          marginRight: 14,
                        }}
                      />
                    )}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}
                        numberOfLines={1}
                      >
                        {friend.display_name || 'Unknown'}
                      </Text>
                      {subtitle ? (
                        <Text
                          style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 2 }}
                          numberOfLines={1}
                        >
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>

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

      {/* Block/Report Sheet (hidden when previewing own profile) */}
      {!isOwnProfile && (
        <BlockReportSheet
          visible={blockReportSheetOpen}
          onClose={() => setBlockReportSheetOpen(false)}
          userId={profile?.user_id || profile?.id}
          userName={firstName}
          onBlocked={() => {
            setBlockReportSheetOpen(false);
          }}
        />
      )}
    </>
  );
}
