import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useThemeContext } from "../components/ThemeContext";

export default function HomeScreen() {
  const { theme } = useThemeContext();
  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Welcome to</Text>
      <Text style={styles(theme).appName}>RedPetal</Text>
      <Text style={styles(theme).subtitle}>Your period tracking companion</Text>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
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
    } as TextStyle,
  });
