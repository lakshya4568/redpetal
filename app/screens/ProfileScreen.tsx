import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { Button } from "react-native-paper";
import { useThemeContext } from "../components/ThemeContext";
import { useAuth } from "../services/auth";

export default function ProfileScreen() {
  const { logout } = useAuth();
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
      marginBottom: theme.spacing.xl,
    } as TextStyle,
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button mode="contained" onPress={logout} style={styles.button}>
        Logout
      </Button>
    </View>
  );
}
