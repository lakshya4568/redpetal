import { Stack } from 'expo-router';
import React from "react";
import { PaperProvider } from "react-native-paper";
import { FontProvider } from "./components/FontProvider";
import { AuthProvider } from "./services/auth";
import { ThemeProvider } from "./components/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FontProvider>
        <AuthProvider>
          <PaperProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/signup" />
            </Stack>
          </PaperProvider>
        </AuthProvider>
      </FontProvider>
    </ThemeProvider>
  );
}
