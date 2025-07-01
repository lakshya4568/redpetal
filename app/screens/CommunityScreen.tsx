import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { useThemeContext } from "../components/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommunityScreen() {
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
      ...theme.typography.headlineLarge,
      color: theme.colors.text,
    } as TextStyle,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
    </View>
  );
}
