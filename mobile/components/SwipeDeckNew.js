// mobile/components/SwipeDeckNew.js
import React, { useMemo, useRef, useState } from 'react';
import { View, Animated, PanResponder, Dimensions, StyleSheet } from 'react-native';
import ProfileCardNew from './ProfileCardNew';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const CARD_WIDTH = SCREEN_WIDTH - 32;
const IDEAL_HEIGHT = CARD_WIDTH * 1.6;
const CARD_HEIGHT = Math.min(IDEAL_HEIGHT, SCREEN_HEIGHT * 0.78);

const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

export default function SwipeDeckNew({
  profiles = [],
  currentIndex = 0,
  onSwipeRight,
  onSwipeLeft,
  onNext,
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const visible = useMemo(
    () => profiles.slice(currentIndex, currentIndex + 3),
    [profiles, currentIndex]
  );

  const swipeEnabled = !detailsOpen;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeEnabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!swipeEnabled) return false;
        // Only respond to horizontal swipes, not vertical scrolling
        // Require significantly more horizontal movement than vertical to avoid hijacking scroll
        const horizontalIntent = Math.abs(gestureState.dx);
        const verticalIntent = Math.abs(gestureState.dy);
        // More strict: require 2x horizontal movement to initiate swipe
        return horizontalIntent > 15 && horizontalIntent > verticalIntent * 2;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!swipeEnabled) return;
        // Only move if horizontal movement is clearly dominant (2x threshold)
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2) {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.12 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!swipeEnabled) return;

        const { dx } = gestureState;

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          const topProfile = visible[0];
          if (dx > 0) {
            animateOut(true, topProfile);
          } else {
            animateOut(false, topProfile);
          }
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        if (!swipeEnabled) return;
        resetPosition();
      },
    })
  ).current;

  function animateOut(isRight, topProfile) {
    if (isAnimating) return;
    setIsAnimating(true);

    const finalX = isRight ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(pan, {
      toValue: { x: finalX, y: 0 },
      duration: 240,
      useNativeDriver: false,
    }).start(() => {
      // callbacks
      if (isRight) onSwipeRight?.(topProfile);
      else onSwipeLeft?.(topProfile);

      resetCard();
    });
  }

  function resetPosition() {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 6,
      tension: 70,
    }).start();
  }

  function resetCard() {
    pan.setValue({ x: 0, y: 0 });
    setIsAnimating(false);
    onNext?.();
  }

  const rotation = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const opacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.85, 1, 0.85],
  });

  if (!visible.length) return null;

  return (
    <View style={styles.container}>
      {/* Render back cards first (absolute) */}
      {visible
        .map((p, i) => ({ p, i }))
        .reverse()
        .map(({ p, i }) => {
          const isTop = i === 0;
          const key = p?.user_id ?? `${currentIndex}-${i}`;

          if (!isTop) {
            // Back card styling: slight scale + vertical offset
            // Hide back cards when details are open
            if (detailsOpen) {
              return null;
            }
            const depth = i; // 1,2...
            return (
              <View
                key={key}
                style={[
                  styles.cardContainer,
                  styles.cardAbsolute,
                  {
                    transform: [{ scale: 1 - 0.04 * depth }, { translateY: 10 * depth }],
                    opacity: 1 - 0.08 * depth,
                  },
                ]}
                pointerEvents="none"
              >
                <ProfileCardNew profile={p} photos={p?.photos || []} />
              </View>
            );
          }

          return (
            <Animated.View
              key={key}
              {...(swipeEnabled ? panResponder.panHandlers : {})}
              style={[
                styles.cardContainer,
                styles.cardAbsolute,
                {
                  transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: rotation }],
                  opacity,
                  zIndex: detailsOpen ? 999 : 1, // Lower z-index when expanded so backdrop can show
                },
              ]}
            >
              <ProfileCardNew
                profile={p}
                photos={p?.photos || []}
                onDetailsOpenChange={setDetailsOpen}
              />
            </Animated.View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18, // tab bar nudge
    position: 'relative',
  },

  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },

  cardAbsolute: {
    position: 'absolute',
  },
});
