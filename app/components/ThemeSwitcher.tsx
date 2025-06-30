import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colorPalettes, switchTheme, theme } from "../theme";

interface ThemeSwitcherProps {
  onThemeChange?: (newTheme: any) => void;
}

export default function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);

  const handleThemeSwitch = (paletteName: keyof typeof colorPalettes) => {
    const newTheme = switchTheme(paletteName);
    setCurrentTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const themeOptions: { key: keyof typeof colorPalettes; name: string; color: string }[] = [
    { key: "blushPink", name: "Blush Pink", color: "#F7CAC9" },
    { key: "roseRed", name: "Rose Red", color: "#E63946" },
    { key: "terracotta", name: "Terracotta", color: "#E06E5A" },
    { key: "dustyMauve", name: "Dusty Mauve", color: "#D8A7B1" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
              style={[styles.themeOption, { borderColor: option.color }]}
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
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Typography Preview</Text>

          <View style={styles.previewContent}>
            <Text
              style={[styles.brandText, { color: currentTheme.colors.primary }]}
            >
              RedPetal
            </Text>
            <Text
              style={[styles.headlineText, { color: currentTheme.colors.text }]}
            >
              A gentle touch for{"\n"}Period wellness
            </Text>
            <Text
              style={[
                styles.bodyText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              This is how your body text will look with the selected theme.
            </Text>
          </View>

          <View style={styles.buttonPreview}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: currentTheme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: currentTheme.colors.textOnPrimary },
                ]}
              >
                Apply
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: currentTheme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: currentTheme.colors.primary },
                ]}
              >
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: "space-between",
    alignItems: "center", // Center everything horizontally
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
    marginBottom: theme.spacing.sm, // Reduce space between palette and preview
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
    padding: theme.spacing.xl, // More padding for larger look
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
    lineHeight: 49, // 1.35x font size
  },
  headlineText: {
    ...theme.typography.headlineMedium,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24, // 1.35x font size
  },
  bodyText: {
    ...theme.typography.bodyMedium,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 19, // 1.35x font size
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
