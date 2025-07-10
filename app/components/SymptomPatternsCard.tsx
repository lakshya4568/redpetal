import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import SectionHeader from "./SectionHeader";
import { useThemeContext } from "./ThemeContext";

export default function SymptomPatternsCard() {
  const { theme } = useThemeContext();

  return (
    <View style={styles(theme).container}>
      <SectionHeader title="My symptom patterns" />
      <View style={styles(theme).card}>
        <Image
          source={require("../../assets/images/symptom-pattern.png")}
          style={styles(theme).image}
        />
        <Text style={styles(theme).title}>No pattern found</Text>
        <Text style={styles(theme).text}>
          What you&apos;ve logged can&apos;t be connected with your cycle right
          now.
        </Text>
        <TouchableOpacity>
          <Text style={styles(theme).link}>Which symptoms are analyzed</Text>
        </TouchableOpacity>
        <Text style={styles(theme).text}>
          But keep logging - the more you log, the more patterns you&apos;ll
          spot.
        </Text>
        <TouchableOpacity style={styles(theme).button}>
          <Text style={styles(theme).buttonText}>Log more symptoms</Text>
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
      alignItems: "center",
    } as ViewStyle,
    image: {
      width: 100,
      height: 100,
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colors.text,
      fontWeight: "bold",
      marginBottom: theme.spacing.sm,
    },
    text: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    link: {
      ...theme.typography.bodyMedium,
      color: theme.colors.primary,
      fontWeight: "bold",
      marginBottom: theme.spacing.md,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: theme.spacing.md,
    },
    buttonText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.primary,
      fontWeight: "bold",
      marginLeft: theme.spacing.sm,
    },
  });
