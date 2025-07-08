import { router } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Button } from "react-native-paper";
import { useThemeContext } from "../components/ThemeContext";
import { useAuth } from "../services/auth";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { theme } = useThemeContext();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  const handleThemePress = () => {
    router.push("/components/ThemeScreen");
  };

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <Text style={styles(theme).title}>Profile</Text>
        <Button
          mode="contained"
          onPress={handleThemePress}
          style={styles(theme).themeButton}
        >
          Theme
        </Button>
      </View>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles(theme).button}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
    } as ViewStyle,
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.xl,
      paddingTop: Platform.OS === "ios" ? 50 : 30,
      paddingRight: Platform.OS === "ios" ? 20 : 16,
    },
    title: {
      ...theme.typography.headlineLarge,
      color: theme.colors.text,
    } as TextStyle,
    themeButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      alignSelf: "center",
      marginTop: theme.spacing.xl,
    },
  });
