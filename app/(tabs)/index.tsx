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
  });
