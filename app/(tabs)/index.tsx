import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useThemeContext } from "../components/ThemeContext";

export default function HomeScreen() {
  const { theme } = useThemeContext();
  return (
    <ScrollView style={styles(theme).container}>
      <View style={styles(theme).content}>
        <Text style={styles(theme).title}>Welcome to</Text>
        <Text style={styles(theme).appName}>RedPetal</Text>
        <Text style={styles(theme).subtitle}>
          Your period tracking companion
        </Text>

        {/* Font Test Section */}
        <View style={styles(theme).fontTestSection}>
          <Text style={styles(theme).sectionTitle}>Font Test</Text>
          <Text style={styles(theme).fontTestBrand}>RedPetal (Pacifico)</Text>
          <Text style={styles(theme).fontTestSubtitle}>
            Beautiful Subtitle (Cookie)
          </Text>
          <Text style={styles(theme).fontTestBody}>
            This is body text using Open Sans font. It should be clean and
            readable.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as ViewStyle,
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: theme.spacing.lg,
      minHeight: 400,
    } as ViewStyle,
    title: {
      ...theme.typography.headlineMedium,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    } as TextStyle,
    appName: {
      ...theme.typography.brand,
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    } as TextStyle,
    subtitle: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    } as TextStyle,
    fontTestSection: {
      width: "100%",
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    } as ViewStyle,
    sectionTitle: {
      ...theme.typography.titleLarge,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    } as TextStyle,
    fontTestBrand: {
      fontFamily: "Pacifico-Title",
      fontSize: 32,
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    } as TextStyle,
    fontTestSubtitle: {
      fontFamily: "Cookie-subtitle",
      fontSize: 24,
      color: theme.colors.accent,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    } as TextStyle,
    fontTestBody: {
      fontFamily: "OpenSans-Body",
      fontSize: 16,
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 24,
    } as TextStyle,
  });
