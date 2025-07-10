import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeContext } from "./ThemeContext";

interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  const { theme } = useThemeContext();
  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>{title}</Text>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colors.text,
    },
  });
