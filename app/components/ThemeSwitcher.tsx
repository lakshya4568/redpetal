import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colorPalettes, switchTheme } from "../theme";
import { useThemeContext } from "./ThemeContext";

interface ThemeSwitcherProps {
  onThemeChange?: (newTheme: any) => void;
}

export default function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const { palette, setPalette, resetPalette, theme } = useThemeContext();
  const [selectedPalette, setSelectedPalette] = useState(palette);
  const [previewTheme, setPreviewTheme] = useState(theme);
  const router = useRouter();

  const handleThemeSwitch = (paletteName: keyof typeof colorPalettes) => {
    setSelectedPalette(paletteName);
    setPreviewTheme(switchTheme(paletteName));
  };

  const handleApply = () => {
    setPalette(selectedPalette);
    onThemeChange?.(previewTheme);
    router.push("/(tabs)");
  };

  const handleRemove = () => {
    resetPalette();
    setSelectedPalette("blushPink");
    setPreviewTheme(switchTheme("blushPink"));
    onThemeChange?.(switchTheme("blushPink"));
  };

  const themeOptions: {
    key: keyof typeof colorPalettes;
    name: string;
    color: string;
  }[] = [
    { key: "blushPink", name: "Blush Pink", color: "#F7CAC9" },
    { key: "roseRed", name: "Rose Red", color: "#E63946" },
    { key: "terracotta", name: "Terracotta", color: "#E06E5A" },
    { key: "dustyMauve", name: "Dusty Mauve", color: "#D8A7B1" },
  ];

  const styles = getStyles(theme);
  const previewStyles = getStyles(previewTheme);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <View style={[styles.container]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Choose Your Theme</Text>
          <Text style={styles.subtitle}>
            Pick a color palette that matches your style
          </Text>
        </View>

        {/* Theme Options Grid */}
        <View style={styles.optionsContainer}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.themeOption,
                { borderColor: option.color },
                selectedPalette === option.key && { borderWidth: 3 },
              ]}
              onPress={() => handleThemeSwitch(option.key)}
            >
              <View
                style={[styles.colorPreview, { backgroundColor: option.color }]}
              />
              <Text style={styles.themeName}>{option.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Typography Preview Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={previewStyles.previewContainer}
          onPress={() => setPreviewTheme(switchTheme(selectedPalette))}
        >
          <Text style={previewStyles.previewTitle}>Typography Preview</Text>

          <View style={previewStyles.previewContent}>
            <Text
              style={[
                previewStyles.brandText,
                { color: previewTheme.colors.primary },
              ]}
            >
              RedPetal
            </Text>
            <Text
              style={[
                previewStyles.headlineText,
                { color: previewTheme.colors.text },
              ]}
            >
              A gentle touch for{"\n"}Period wellness
            </Text>
            <Text
              style={[
                previewStyles.bodyText,
                { color: previewTheme.colors.textSecondary },
              ]}
            >
              This is how your body text will look with the selected theme.
            </Text>
          </View>

          <View style={previewStyles.buttonPreview}>
            <TouchableOpacity
              style={[
                previewStyles.primaryButton,
                { backgroundColor: previewTheme.colors.primary },
              ]}
              onPress={handleApply}
            >
              <Text
                style={[
                  previewStyles.buttonText,
                  { color: previewTheme.colors.textOnPrimary },
                ]}
              >
                Apply
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                previewStyles.secondaryButton,
                { borderColor: previewTheme.colors.primary },
              ]}
              onPress={handleRemove}
            >
              <Text
                style={[
                  previewStyles.buttonText,
                  { color: previewTheme.colors.primary },
                ]}
              >
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getStyles(theme: any) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.headlineLarge,
      fontSize: 28,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodyLarge,
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: theme.spacing.sm,
    },
    themeOption: {
      width: "48.5%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xxl,
      padding: theme.spacing.sm,
      alignItems: "center",
      borderWidth: 2,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    colorPreview: {
      width: 30,
      height: 30,
      borderRadius: theme.borderRadius.round,
      marginBottom: theme.spacing.sm,
    },
    themeName: {
      ...theme.typography.titleMedium,
      fontSize: 14,
      color: theme.colors.text,
    },
    previewContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xxxl,
      padding: theme.spacing.xl,
      minWidth: 320,
      minHeight: 220,
      alignSelf: "center",
      width: "100%",
      ...theme.shadows.md,
    },
    previewTitle: {
      ...theme.typography.titleLarge,
      fontSize: 20,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    previewContent: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
    },
    brandText: {
      ...theme.typography.brand,
      fontSize: 36,
      textAlign: "center",
      marginBottom: 8,
      lineHeight: 49,
    },
    headlineText: {
      ...theme.typography.headlineMedium,
      fontSize: 18,
      textAlign: "center",
      marginBottom: 8,
      lineHeight: 24,
    },
    bodyText: {
      ...theme.typography.bodyMedium,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 19,
      marginBottom: 0,
    },
    buttonPreview: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: theme.spacing.sm,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xxl,
      alignItems: "center",
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.xxl,
      borderWidth: 1,
      alignItems: "center",
    },
    buttonText: {
      ...theme.typography.button,
      fontSize: 14,
    },
  });
}
