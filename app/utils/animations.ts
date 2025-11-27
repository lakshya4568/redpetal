/**
 * RedPetal V2 - Optimized Animation Utilities
 * Performance-focused animations with 60fps target for Android
 */

import { Dimensions } from "react-native";
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive sizing based on Android device
export const responsive = {
  // Base unit scaled to screen width (based on 375px design)
  wp: (percentage: number) => (SCREEN_WIDTH * percentage) / 100,
  hp: (percentage: number) => (SCREEN_HEIGHT * percentage) / 100,
  // Font scaling
  fs: (size: number) => (size * SCREEN_WIDTH) / 375,
  // Spacing scaling
  sp: (size: number) => Math.round((size * SCREEN_WIDTH) / 375),
  // Full dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  // Safe area values for Android
  statusBarHeight: 24,
  bottomNavHeight: 80,
};

// Optimized spring configurations for 60fps
export const springConfigs = {
  // Quick, snappy interactions (buttons, toggles)
  snappy: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // Smooth transitions (modals, sheets)
  smooth: {
    damping: 25,
    stiffness: 200,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // Bouncy animations (success states, celebrations)
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.6,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // Gentle movements (cards, lists)
  gentle: {
    damping: 18,
    stiffness: 120,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  // Tab bar indicator
  tabIndicator: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Optimized timing configurations
export const timingConfigs = {
  fast: { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  normal: { duration: 250, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  slow: { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
  // For fade animations
  fadeIn: { duration: 200, easing: Easing.out(Easing.ease) },
  fadeOut: { duration: 150, easing: Easing.in(Easing.ease) },
  // For scale animations
  scaleUp: { duration: 200, easing: Easing.bezier(0.34, 1.56, 0.64, 1) },
  scaleDown: { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
};

// Animation presets for common use cases
export const animationPresets = {
  // Card press animation
  cardPress: {
    scale: 0.97,
    opacity: 0.9,
    duration: 100,
  },
  // List item entrance
  listItemEntrance: {
    initialY: 20,
    initialOpacity: 0,
    duration: 300,
    staggerDelay: 50,
  },
  // Fade in/out
  fade: {
    duration: 200,
  },
  // Slide in from bottom
  slideUp: {
    initialY: 50,
    duration: 350,
  },
  // Pulse animation
  pulse: {
    scale: 1.05,
    duration: 500,
  },
};

// Hook for card press animation
export const useCardPressAnimation = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, springConfigs.snappy);
    opacity.value = withTiming(0.9, timingConfigs.fast);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, springConfigs.snappy);
    opacity.value = withTiming(1, timingConfigs.fast);
  };

  return { animatedStyle, onPressIn, onPressOut };
};

// Hook for staggered list entrance animation
export const useStaggeredEntrance = (index: number, delay: number = 50) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const animate = () => {
    translateY.value = withDelay(
      index * delay,
      withSpring(0, springConfigs.gentle)
    );
    opacity.value = withDelay(
      index * delay,
      withTiming(1, timingConfigs.normal)
    );
  };

  return { animatedStyle, animate };
};

// Hook for fade in animation
export const useFadeIn = (delay: number = 0) => {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fadeIn = () => {
    opacity.value = withDelay(delay, withTiming(1, timingConfigs.fadeIn));
  };

  const fadeOut = () => {
    opacity.value = withTiming(0, timingConfigs.fadeOut);
  };

  return { animatedStyle, fadeIn, fadeOut, opacity };
};

// Hook for scale animation
export const useScaleAnimation = (initialScale: number = 0.8) => {
  const scale = useSharedValue(initialScale);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = () => {
    scale.value = withSpring(1, springConfigs.bouncy);
  };

  const scaleOut = () => {
    scale.value = withTiming(initialScale, timingConfigs.scaleDown);
  };

  return { animatedStyle, scaleIn, scaleOut, scale };
};

// Hook for slide up animation
export const useSlideUp = (initialY: number = 50) => {
  const translateY = useSharedValue(initialY);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const slideIn = () => {
    translateY.value = withSpring(0, springConfigs.smooth);
    opacity.value = withTiming(1, timingConfigs.normal);
  };

  const slideOut = () => {
    translateY.value = withTiming(initialY, timingConfigs.normal);
    opacity.value = withTiming(0, timingConfigs.fast);
  };

  return { animatedStyle, slideIn, slideOut };
};

// Hook for pulse animation (for notifications, highlights)
export const usePulseAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withSpring(1, springConfigs.snappy)
    );
  };

  const continuousPulse = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  };

  const stopPulse = () => {
    scale.value = withTiming(1, timingConfigs.fast);
  };

  return { animatedStyle, pulse, continuousPulse, stopPulse };
};

// Optimized interpolation helpers
export const interpolateProgress = (
  progress: number,
  inputRange: number[],
  outputRange: number[]
) => {
  "worklet";
  return interpolate(progress, inputRange, outputRange);
};

// Shared value factory for common animations - use as custom hook
export const useSharedValues = () => ({
  opacity: useSharedValue(1),
  scale: useSharedValue(1),
  translateX: useSharedValue(0),
  translateY: useSharedValue(0),
  rotate: useSharedValue(0),
});
