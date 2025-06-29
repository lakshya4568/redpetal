import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './services/auth';
import AppNavigator from './navigation/AppNavigator';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}