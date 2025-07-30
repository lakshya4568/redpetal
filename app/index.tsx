import { Redirect } from "expo-router";
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAuth } from "./services/auth";
import { useThemeContext } from "./components/ThemeContext";

export default function Index() {
  const { user, loading } = useAuth();
  const { theme } = useThemeContext();

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{
          ...theme.typography.bodyLarge,
          color: theme.colors.text,
          marginTop: theme.spacing.md
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}
