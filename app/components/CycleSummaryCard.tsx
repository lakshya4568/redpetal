import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import SectionHeader from "./SectionHeader";
import { useThemeContext } from "./ThemeContext";

export default function CycleSummaryCard() {
  const { theme } = useThemeContext();

  return (
    <View style={styles(theme).container}>
      <SectionHeader title="Cycle summary" />
      <View style={styles(theme).card}>
        <Text style={styles(theme).text}>
          The more you share with us, the better Flo works. Log 2 or more
          periods to get personalized analysis of your most recent cycles.
        </Text>
        <View style={styles(theme).row}>
          <Text style={styles(theme).label}>Previous cycle length</Text>
          <Text style={[styles(theme).value, styles(theme).abnormal]}>
            Abnormal
          </Text>
        </View>
        <View style={styles(theme).row}>
          <Text style={styles(theme).label}>Previous period length</Text>
          <Text style={[styles(theme).value, styles(theme).normal]}>
            Normal
          </Text>
        </View>
        <View style={styles(theme).row}>
          <Text style={styles(theme).label}>Cycle length variation</Text>
          <Text style={[styles(theme).value, styles(theme).irregular]}>
            Irregular
          </Text>
        </View>
        <TouchableOpacity style={styles(theme).button}>
          <Text style={styles(theme).buttonText}>Log recent periods</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
    } as ViewStyle,
    text: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    label: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
    },
    value: {
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
    },
    abnormal: {
      color: theme.colors.error,
    },
    normal: {
      color: theme.colors.success,
    },
    irregular: {
      color: theme.colors.warning,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.xl,
      marginTop: theme.spacing.lg,
      alignSelf: "center",
    },
    buttonText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.background,
      fontWeight: "bold",
    },
  });
