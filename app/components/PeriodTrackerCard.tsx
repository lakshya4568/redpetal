/**
 * PeriodTrackerCard - Redesigned for RedPetal V2
 * Clean circular progress indicator with animated status display
 */

import React, { useCallback, useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { responsive, springConfigs } from "../utils/animations";
import { AppTheme, useThemeContext } from "./ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PeriodTrackerCardProps {
  daysLate?: number;
  cycleDay?: number;
  totalCycleDays?: number;
  onLogPress?: () => void;
}

export default function PeriodTrackerCard({
  daysLate = 3,
  cycleDay = 31,
  totalCycleDays = 28,
  onLogPress,
}: PeriodTrackerCardProps) {
  const { theme } = useThemeContext();

  // Animation values
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const progressAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  // Circle dimensions
  const circleSize = responsive.wp(50);
  const strokeWidth = responsive.sp(8);
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress (capped at 100%)
  const progress = Math.min(cycleDay / totalCycleDays, 1);

  // Entrance animation
  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 400 });
    cardScale.value = withSpring(1, springConfigs.gentle);
    progressAnimation.value = withTiming(progress, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [cardOpacity, cardScale, progressAnimation, progress]);

  // Pulse animation when late
  useEffect(() => {
    if (daysLate > 0) {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [daysLate, pulseAnimation]);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }, { scale: pulseAnimation.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Animated circle props
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progressAnimation.value);
    return {
      strokeDashoffset,
    };
  });

  // Button handlers
  const handlePressIn = useCallback(() => {
    buttonScale.value = withSpring(0.95, springConfigs.snappy);
  }, [buttonScale]);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withSpring(1, springConfigs.snappy);
  }, [buttonScale]);

  const isLate = daysLate > 0;

  return (
    <Animated.View style={[styles(theme).container, cardAnimatedStyle]}>
      {/* Progress Circle */}
      <View style={styles(theme).circleContainer}>
        <Svg width={circleSize} height={circleSize} style={styles(theme).svg}>
          {/* Background Circle */}
          <Circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke={theme.colors.borderLight}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke={isLate ? theme.colors.accent : theme.colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${circleSize / 2}, ${circleSize / 2}`}
          />
        </Svg>

        {/* Center Content */}
        <View style={styles(theme).centerContent}>
          <Text style={styles(theme).statusLabel}>
            {isLate ? "Late" : "Day"}
          </Text>
          <Text style={styles(theme).daysText}>
            {isLate ? daysLate : cycleDay}
          </Text>
          <Text style={styles(theme).daysLabel}>
            {isLate ? "days" : `of ${totalCycleDays}`}
          </Text>
        </View>
      </View>

      {/* Log Button */}
      <Pressable
        onPress={onLogPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles(theme).logButton, buttonAnimatedStyle]}>
          <Text style={styles(theme).logButtonText}>Log period</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: responsive.sp(24),
      paddingHorizontal: responsive.sp(20),
    },
    circleContainer: {
      width: responsive.wp(50),
      height: responsive.wp(50),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: responsive.sp(20),
    },
    svg: {
      position: "absolute",
    },
    centerContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    statusLabel: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(22),
      color: theme.colors.textSecondary,
      marginBottom: responsive.sp(4),
    },
    daysText: {
      fontFamily: theme.fonts.title.family,
      fontSize: responsive.fs(48),
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: responsive.fs(54),
    },
    daysLabel: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      color: theme.colors.textMuted,
      marginTop: responsive.sp(2),
    },
    logButton: {
      backgroundColor: theme.colors.surface,
      paddingVertical: responsive.sp(14),
      paddingHorizontal: responsive.sp(32),
      borderRadius: responsive.sp(24),
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    logButtonText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
  });
