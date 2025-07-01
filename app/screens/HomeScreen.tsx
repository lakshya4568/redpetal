import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useThemeContext } from "../components/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.appName}>RedPetal</Text>
      <Text style={styles.subtitle}>Your period tracking companion</Text>
    </View>
  );
}
