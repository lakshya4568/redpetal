/**
 * InsightCard - Redesigned for RedPetal V2
 * Compact cards with scale animations for horizontal scroll
 */

import React, { useCallback, useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { responsive, springConfigs, timingConfigs } from "../utils/animations";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  index?: number;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function InsightCard({
  title,
  icon,
  index = 0,
  onPress,
}: InsightCardProps) {
  const { theme } = useThemeContext();

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pressScale = useSharedValue(1);

  // Entrance animation with stagger
  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
    scale.value = withDelay(delay, withSpring(1, springConfigs.bouncy));
  }, [index, opacity, scale]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  // Press handlers
  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.95, springConfigs.snappy);
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, springConfigs.snappy);
  }, [pressScale]);

  return (
    <AnimatedPressable
      style={[styles(theme).card, containerStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles(theme).iconContainer}>{icon}</View>
      <Text style={styles(theme).title} numberOfLines={2}>
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: responsive.sp(16),
      padding: responsive.sp(14),
      alignItems: "center",
      justifyContent: "center",
      width: responsive.wp(36),
      height: responsive.wp(36),
      marginHorizontal: responsive.sp(6),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    iconContainer: {
      marginBottom: responsive.sp(8),
    },
    title: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(13),
      fontWeight: "500",
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: responsive.fs(18),
    },
  });
