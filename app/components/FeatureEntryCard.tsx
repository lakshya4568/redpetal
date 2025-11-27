import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface FeatureEntryCardProps {
  title: string;
  description: string;
  icon: keyof typeof FontAwesome.glyphMap;
  route?: string;
  comingSoon?: boolean;
  gradientColors?: [string, string];
}

export default function FeatureEntryCard({
  title,
  description,
  icon,
  route,
  comingSoon = false,
  gradientColors,
}: FeatureEntryCardProps) {
  const { theme } = useThemeContext();
  const colors = gradientColors || theme.gradients.primary;

  const handlePress = () => {
    if (!comingSoon && route) {
      router.push(route as never);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles(theme).container,
        pressed && !comingSoon && styles(theme).pressed,
      ]}
      onPress={handlePress}
      disabled={comingSoon}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles(theme).gradient}
      >
        <View style={styles(theme).iconContainer}>
          <FontAwesome
            name={icon}
            size={32}
            color={theme.colors.textOnPrimary}
          />
        </View>
        <View style={styles(theme).textContainer}>
          <View style={styles(theme).titleRow}>
            <Text style={styles(theme).title}>{title}</Text>
            {comingSoon && (
              <View style={styles(theme).comingSoonBadge}>
                <Text style={styles(theme).comingSoonText}>Coming Soon</Text>
              </View>
            )}
          </View>
          <Text style={styles(theme).description}>{description}</Text>
        </View>
        {!comingSoon && (
          <FontAwesome
            name="chevron-right"
            size={18}
            color={theme.colors.textOnPrimary}
            style={styles(theme).chevron}
          />
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      borderRadius: theme.organicCard.borderRadius,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.organicCard.shadowColor,
          shadowOffset: theme.organicCard.shadowOffset,
          shadowOpacity: theme.organicCard.shadowOpacity,
          shadowRadius: theme.organicCard.shadowRadius,
        },
        android: {
          elevation: theme.organicCard.elevation,
        },
      }),
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    gradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.lg,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.titleMedium.fontSize,
      fontFamily: theme.fonts.subtitle.family,
      fontWeight: "600",
      color: theme.colors.textOnPrimary,
    },
    comingSoonBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.round,
    },
    comingSoonText: {
      fontSize: theme.typography.labelSmall.fontSize,
      color: theme.colors.textOnPrimary,
      fontWeight: "600",
    },
    description: {
      fontSize: theme.typography.bodySmall.fontSize,
      color: theme.colors.textOnPrimary,
      opacity: 0.9,
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
  });
