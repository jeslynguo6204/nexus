// mobile/components/SwipeDeck.js
import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';
import ProfileCard from './ProfileCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH; // swipe if moved 25% of screen

export default function SwipeDeck({
  profile,
  photos,
  onSwipeRight,
  onSwipeLeft,
  onNext,
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          if (dx > 0) {
            // Swipe right
            animateOut(true);
            onSwipeRight?.();
          } else {
            // Swipe left
            animateOut(false);
            onSwipeLeft?.();
          }
        } else {
          // Snap back
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
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      resetCard();
    });
  }

  function resetPosition() {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }

  function resetCard() {
    pan.setValue({ x: 0, y: 0 });
    setIsAnimating(false);
    onNext?.();
  }

  const rotation = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  const opacity = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate: rotation },
            ],
            opacity,
          },
        ]}
      >
        <ProfileCard profile={profile} photos={photos} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    height: '100%',
  },
});
