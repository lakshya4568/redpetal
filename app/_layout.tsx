import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../services/auth";
import ErrorBoundary from "./components/ErrorBoundary";
import { FontProvider } from "./components/FontProvider";
import { ThemeProvider } from "./components/ThemeContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <FontProvider>
              <AuthProvider>
                <PaperProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="features" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/signup" />
                  </Stack>
                </PaperProvider>
              </AuthProvider>
            </FontProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
