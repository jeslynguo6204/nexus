// mobile/components/SwipeDeckNew.js
import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, Dimensions, StyleSheet } from 'react-native';
import ProfileCardNew from './ProfileCardNew';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const CARD_WIDTH = SCREEN_WIDTH - 32;
const IDEAL_HEIGHT = CARD_WIDTH * 1.6;
const CARD_HEIGHT = Math.min(IDEAL_HEIGHT, SCREEN_HEIGHT * 0.78);

const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

export default function SwipeDeckNew({
  profile,
  photos,
  onSwipeRight,
  onSwipeLeft,
  onNext,
  onLike,
  onPass,
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // keep vertical movement subtle so it feels “premium”
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.12 });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          if (dx > 0) {
            animateOut(true);
            onSwipeRight?.();
          } else {
            animateOut(false);
            onSwipeLeft?.();
          }
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  function animateOut(isRight) {
    if (isAnimating) return;
    setIsAnimating(true);

    const finalX = isRight ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(pan, {
      toValue: { x: finalX, y: 0 },
      duration: 240,
      useNativeDriver: false,
    }).start(() => resetCard());
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

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: rotation }],
            opacity,
          },
        ]}
      >
        <ProfileCardNew profile={profile} photos={photos} onLike={onLike} onPass={onPass} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Centering fixes the huge “white dead zone” under the card
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18, // nudge up slightly since the tab bar exists
  },

  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
});
