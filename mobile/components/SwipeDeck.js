// mobile/components/SwipeDeck.js

/**
 * SwipeDeck is a component used on the HomeScreen to display a stack of ProfileCards
 * that the user can swipe left or right on to dismiss or like potential matches.
 * 
 * The component receives an array of user profiles and their photos through props, 
 * along with callback functions to handle the swiping interactions (onSwipeLeft, 
 * onSwipeRight) and moving to the next card (onNext).
 * 
 * Internally, SwipeDeck uses the React Native PanResponder to track the user's touch
 * interactions and determine the direction and distance of their swipe. When a swipe
 * exceeds a certain threshold, the corresponding callback function is triggered and 
 * the current card is animated off the screen.
 * 
 * The ProfileCard component is rendered within SwipeDeck to display each user's 
 * profile information. SwipeDeck dynamically styles the ProfileCard to create the 
 * illusion of a stack of cards and to provide visual feedback during swiping.
 * 
 * By encapsulating the complex swiping interaction and the rendering of the profile 
 * cards, SwipeDeck provides a reusable and modular component for implementing a core
 * feature of the dating app. It is used on the HomeScreen to facilitate the user's 
 * discovery and selection of potential matches.
 */

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
