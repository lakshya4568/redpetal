/**
 * SectionHeader - Redesigned for RedPetal V2
 * Clean typography with fade-in animation
 */

import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { responsive } from "../utils/animations";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

export default function SectionHeader({
  title,
  showViewAll = false,
  onViewAllPress,
}: SectionHeaderProps) {
  const { theme } = useThemeContext();

  // Animation values
  const opacity = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateX: interpolate(
          opacity.value,
          [0, 1],
          [-10, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles(theme).container, animatedStyle]}>
      <Text style={styles(theme).title}>{title}</Text>
      {showViewAll && (
        <Text style={styles(theme).viewAll} onPress={onViewAllPress}>
          View All
        </Text>
      )}
    </Animated.View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: responsive.sp(20),
      paddingTop: responsive.sp(24),
      paddingBottom: responsive.sp(12),
    },
    title: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(20),
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    viewAll: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      fontWeight: "500",
      color: theme.colors.primary,
    },
  });
