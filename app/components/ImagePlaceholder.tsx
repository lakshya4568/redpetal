/**
 * ImagePlaceholder — Reusable image placeholder component
 *
 * Renders a themed placeholder with an icon when an image is not yet available.
 * Once the real image is placed in assets/images/ with the correct filename,
 * swap the usage from <ImagePlaceholder /> to <Image source={require('...')} />.
 *
 * Usage:
 *   <ImagePlaceholder
 *     width={240}
 *     height={120}
 *     label="insight-wellness"
 *     icon="image"
 *   />
 *
 * See assets/IMAGE_MANIFEST.md for the full list of required image assets.
 */

import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

type PlaceholderVariant = "card" | "hero" | "avatar" | "icon" | "banner";

interface ImagePlaceholderProps {
  /** Width of the placeholder container */
  width?: number | string;
  /** Height of the placeholder container */
  height?: number | string;
  /** Short label shown beneath the icon (describes which asset goes here) */
  label?: string;
  /** FontAwesome icon name to show in the center */
  icon?: string;
  /** Icon size override (defaults based on variant) */
  iconSize?: number;
  /** Border radius override */
  borderRadius?: number;
  /** Variant style preset */
  variant?: PlaceholderVariant;
  /** Custom style overrides */
  style?: object;
}

const VARIANT_DEFAULTS: Record<
  PlaceholderVariant,
  { iconSize: number; borderRadius: number }
> = {
  card: { iconSize: 32, borderRadius: 16 },
  hero: { iconSize: 48, borderRadius: 20 },
  avatar: { iconSize: 24, borderRadius: 999 },
  icon: { iconSize: 20, borderRadius: 8 },
  banner: { iconSize: 40, borderRadius: 12 },
};

export default function ImagePlaceholder({
  width = "100%",
  height = 120,
  label,
  icon = "image",
  iconSize,
  borderRadius,
  variant = "card",
  style,
}: ImagePlaceholderProps) {
  const { theme } = useThemeContext();

  const defaults = VARIANT_DEFAULTS[variant];
  const resolvedIconSize = iconSize ?? defaults.iconSize;
  const resolvedBorderRadius = borderRadius ?? defaults.borderRadius;

  return (
    <View
      style={[
        styles(theme).container,
        {
          width: width as number,
          height: height as number,
          borderRadius: resolvedBorderRadius,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          theme.colors.surfaceVariant,
          theme.colors.overlay
            .replace("0.1)", "0.2)")
            .replace("0.08)", "0.15)"),
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles(theme).gradient, { borderRadius: resolvedBorderRadius }]}
      >
        {/* Decorative petal shapes in background */}
        <View style={styles(theme).petalDecor1} />
        <View style={styles(theme).petalDecor2} />

        <View style={styles(theme).content}>
          <View
            style={[
              styles(theme).iconCircle,
              {
                width: resolvedIconSize * 2,
                height: resolvedIconSize * 2,
                borderRadius: resolvedIconSize,
              },
            ]}
          >
            <FontAwesome
              name={icon as keyof typeof FontAwesome.glyphMap}
              size={resolvedIconSize}
              color={theme.colors.primary + "80"}
            />
          </View>
          {label ? (
            <Text style={styles(theme).label} numberOfLines={1}>
              {label}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceVariant,
      ...Platform.select({
        android: {
          elevation: 1,
        },
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
      }),
    },
    gradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    petalDecor1: {
      position: "absolute",
      top: -20,
      right: -20,
      width: 60,
      height: 60,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 40,
      borderBottomRightRadius: 40,
      borderBottomLeftRadius: 20,
      backgroundColor: theme.colors.primary,
      opacity: 0.04,
      transform: [{ rotate: "30deg" }],
    },
    petalDecor2: {
      position: "absolute",
      bottom: -15,
      left: -15,
      width: 50,
      height: 50,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 32,
      borderBottomRightRadius: 32,
      borderBottomLeftRadius: 16,
      backgroundColor: theme.colors.accent,
      opacity: 0.04,
      transform: [{ rotate: "-20deg" }],
    },
    content: {
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    iconCircle: {
      backgroundColor: theme.colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      fontWeight: "600",
      color: theme.colors.textMuted,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
