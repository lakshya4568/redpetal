/**
 * FeatureEntryCard - Redesigned for RedPetal V2
 * Glassmorphic cards with smooth spring animations
 */

import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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

interface FeatureEntryCardProps {
  title: string;
  description: string;
  icon: keyof typeof FontAwesome.glyphMap;
  route?: string;
  comingSoon?: boolean;
  gradientColors?: [string, string];
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FeatureEntryCard({
  title,
  description,
  icon,
  route,
  comingSoon = false,
  gradientColors,
  index = 0,
}: FeatureEntryCardProps) {
  const { theme } = useThemeContext();
  const colors = gradientColors || theme.gradients.primary;

  // Animation values
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-30);
  const scale = useSharedValue(1);
  const chevronTranslate = useSharedValue(0);

  // Entrance animation with stagger
  useEffect(() => {
    const delay = index * 100;
    opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
    translateX.value = withDelay(delay, withSpring(0, springConfigs.gentle));
  }, [index, opacity, translateX]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chevronTranslate.value }],
  }));

  // Press handlers
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, springConfigs.snappy);
    chevronTranslate.value = withSpring(4, springConfigs.snappy);
  }, [scale, chevronTranslate]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.snappy);
    chevronTranslate.value = withSpring(0, springConfigs.snappy);
  }, [scale, chevronTranslate]);

  const handlePress = useCallback(() => {
    if (!comingSoon && route) {
      router.push(route as never);
    }
  }, [comingSoon, route]);

  return (
    <AnimatedPressable
      style={[styles(theme).container, containerStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={comingSoon}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles(theme).gradient}
      >
        {/* Icon */}
        <View style={styles(theme).iconContainer}>
          <FontAwesome
            name={icon}
            size={responsive.sp(28)}
            color={theme.colors.textOnPrimary}
          />
        </View>

        {/* Content */}
        <View style={styles(theme).textContainer}>
          <View style={styles(theme).titleRow}>
            <Text style={styles(theme).title} numberOfLines={1}>
              {title}
            </Text>
            {comingSoon && (
              <View style={styles(theme).comingSoonBadge}>
                <Text style={styles(theme).comingSoonText}>Soon</Text>
              </View>
            )}
          </View>
          <Text style={styles(theme).description} numberOfLines={2}>
            {description}
          </Text>
        </View>

        {/* Chevron */}
        {!comingSoon && (
          <Animated.View style={chevronStyle}>
            <FontAwesome
              name="chevron-right"
              size={responsive.sp(16)}
              color={theme.colors.textOnPrimary}
              style={styles(theme).chevron}
            />
          </Animated.View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: responsive.sp(20),
      marginVertical: responsive.sp(8),
      borderRadius: responsive.sp(20),
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    gradient: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: responsive.sp(18),
      paddingHorizontal: responsive.sp(16),
    },
    iconContainer: {
      width: responsive.sp(52),
      height: responsive.sp(52),
      borderRadius: responsive.sp(26),
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: responsive.sp(14),
    },
    textContainer: {
      flex: 1,
      justifyContent: "center",
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: responsive.sp(4),
    },
    title: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(18),
      fontWeight: "600",
      color: theme.colors.textOnPrimary,
      marginRight: responsive.sp(8),
    },
    comingSoonBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      paddingHorizontal: responsive.sp(8),
      paddingVertical: responsive.sp(2),
      borderRadius: responsive.sp(12),
    },
    comingSoonText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(10),
      color: theme.colors.textOnPrimary,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    description: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(13),
      color: theme.colors.textOnPrimary,
      opacity: 0.9,
      lineHeight: responsive.fs(18),
    },
    chevron: {
      marginLeft: responsive.sp(8),
      opacity: 0.8,
    },
  });
