import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useThemeContext } from "../components/ThemeContext";

export default function ResourcesScreen() {
  const { theme } = useThemeContext();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    } as ViewStyle,
    title: {
      ...theme.typography.headlineLarge,
      color: theme.colors.text,
    } as TextStyle,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resources</Text>
    </View>
  );
}
