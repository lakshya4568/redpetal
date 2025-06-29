import React, { useState } from "react";
import {
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
    {
      key: "blushPink" as const,
      name: "Blush Pink",
      description: "Warm and friendly",
      color: "#F7CAC9",
    },
    {
      key: "roseRed" as const,
      name: "Rose Red",
      description: "Feminine and modern",
      color: "#E63946",
    },
    {
      key: "terracotta" as const,
      name: "Terracotta",
      description: "Natural and earthy",
      color: "#E06E5A",
    },
    {
      key: "dustyMauve" as const,
      name: "Dusty Mauve",
      description: "Soothing and mature",
      color: "#D8A7B1",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Theme</Text>
      <Text style={styles.subtitle}>
        Pick a color palette that matches your style
      </Text>

      <ScrollView
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.themeOption, { borderColor: option.color }]}
            onPress={() => handleThemeSwitch(option.key)}
          >
            <View
              style={[styles.colorPreview, { backgroundColor: option.color }]}
            />
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>{option.name}</Text>
              <Text style={styles.themeDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Typography Preview</Text>
        <Text
          style={[styles.brandText, { color: currentTheme.colors.primary }]}
        >
          RedPetal
        </Text>
        <Text
          style={[styles.headlineText, { color: currentTheme.colors.text }]}
        >
          Beautiful Headlines
        </Text>
        <Text
          style={[
            styles.bodyText,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          This is how your body text will look with the selected theme. Clean,
          readable, and perfectly styled.
        </Text>

        <View style={styles.buttonPreview}>
          <View
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
              Primary Button
            </Text>
          </View>
          <View
            style={[
              styles.secondaryButton,
              {
                borderColor: currentTheme.colors.primary,
                backgroundColor: "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: currentTheme.colors.primary },
              ]}
            >
              Secondary
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
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
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    ...theme.typography.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  themeDescription: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textMuted,
  },
  previewContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.md,
  },
  previewTitle: {
    ...theme.typography.titleLarge,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
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
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  buttonPreview: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: theme.spacing.md,
  },
  primaryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    alignItems: "center",
  },
  secondaryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    ...theme.typography.button,
  },
});
