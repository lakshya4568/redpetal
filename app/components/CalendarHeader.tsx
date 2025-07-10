import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeContext } from "./ThemeContext";

export default function CalendarHeader() {
  const { theme } = useThemeContext();
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const dates = [6, 7, 8, 9, 10, 11, 12];
  const today = 10;

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).month}>10 July</Text>
      <View style={styles(theme).weekContainer}>
        {days.map((day, index) => (
          <View key={index} style={styles(theme).dayWrapper}>
            <Text style={styles(theme).dayText}>{day}</Text>
            <TouchableOpacity
              style={[
                styles(theme).dateContainer,
                dates[index] === today && styles(theme).todayContainer,
              ]}
            >
              <Text
                style={[
                  styles(theme).dateText,
                  dates[index] === today && styles(theme).todayText,
                ]}
              >
                {dates[index]}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    month: {
      ...theme.typography.headlineSmall,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    weekContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    dayWrapper: {
      alignItems: "center",
    },
    dayText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    dateContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    todayContainer: {
      backgroundColor: theme.colors.primary,
    },
    dateText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
    },
    todayText: {
      color: theme.colors.background,
    },
  });
