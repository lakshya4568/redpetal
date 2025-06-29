import React from "react";
import { PaperProvider } from "react-native-paper";
import { FontProvider } from "./components/FontProvider";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./services/auth";

export default function RootLayout() {
  return (
    <FontProvider>
      <AuthProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </AuthProvider>
    </FontProvider>
  );
}
