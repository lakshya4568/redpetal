import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { theme } from "../theme";

export default function ThemeScreen() {
  return (
    <View style={styles.container}>
      <ThemeSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "ios" ? 36 : 20,
    paddingHorizontal: theme.spacing.md,
  },
});
