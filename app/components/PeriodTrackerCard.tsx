import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

export default function PeriodTrackerCard() {
  const { theme } = useThemeContext();
  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).card}>
        <Text style={styles(theme).text}>Late for</Text>
        <Text style={styles(theme).days}>3 days</Text>
        <TouchableOpacity style={styles(theme).button}>
          <Text style={styles(theme).buttonText}>Log period</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      padding: theme.spacing.lg,
    } as ViewStyle,
    card: {
      alignItems: "center",
      padding: theme.spacing.lg,
    } as ViewStyle,
    text: {
      ...theme.typography.headlineMedium,
      color: theme.colors.text,
    } as TextStyle,
    days: {
      ...theme.typography.headlineLarge,
      color: theme.colors.text,
      fontWeight: "bold",
      marginVertical: theme.spacing.sm,
    } as TextStyle,
    button: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.xl,
      marginTop: theme.spacing.md,
    },
    buttonText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      fontWeight: "bold",
    },
  });
