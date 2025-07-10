import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
}

export default function InsightCard({ title, icon }: InsightCardProps) {
  const { theme } = useThemeContext();
  return (
    <TouchableOpacity style={styles(theme).card}>
      {icon}
      <Text style={styles(theme).title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: "center",
      justifyContent: "center",
      width: 150,
      height: 150,
      margin: theme.spacing.sm,
    } as ViewStyle,
    title: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      textAlign: "center",
      marginTop: theme.spacing.sm,
    } as TextStyle,
  });
