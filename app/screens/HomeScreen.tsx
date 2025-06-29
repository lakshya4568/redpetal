import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.appName}>RedPetal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.main,
    color: theme.colors.text,
    textAlign: 'center',
  },
  appName: {
    fontSize: 48,
    fontFamily: theme.fonts.cursive,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
  },
});
