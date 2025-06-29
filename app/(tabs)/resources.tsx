import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { theme } from "../theme";

export default function ResourcesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resources</Text>
    </View>
  );
}

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
