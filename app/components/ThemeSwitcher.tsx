import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
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

  const themeOptions = [
    { key: "blushPink", name: "Blush Pink", color: "#F7CAC9" },
    { key: "roseRed", name: "Rose Red", color: "#E63946" },
    { key: "terracotta", name: "Terracotta", color: "#E06E5A" },
    { key: "dustyMauve", name: "Dusty Mauve", color: "#D8A7B1" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
      >
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
              A gentle touch for Period wellness
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: theme.spacing.md,
  },
  headerContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.headlineLarge,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  themeOption: {
    width: "48.5%", // Use percentage for responsive grid
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 2,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.md,
  },
  themeName: {
    ...theme.typography.titleMedium,
    color: theme.colors.text,
  },
  previewContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  previewTitle: {
    ...theme.typography.titleLarge,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  previewContent: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  brandText: {
    ...theme.typography.brand,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  headlineText: {
    ...theme.typography.headlineMedium,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    ...theme.typography.bodyMedium,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonPreview: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: theme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    alignItems: "center",
  },
  buttonText: {
    ...theme.typography.button,
  },
});