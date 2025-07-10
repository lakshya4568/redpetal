import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

export default function CalendarHeader() {
  const { theme } = useThemeContext();
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  // Create a wider range of dates for scrolling
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = new Date().getDate();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).month}>
        {today} {currentMonth}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles(theme).weekContainer}
      >
        {dates.map((date, index) => (
          <View key={index} style={styles(theme).dayWrapper}>
            <Text style={styles(theme).dayText}>
              {
                days[
                  new Date(currentYear, new Date().getMonth(), date).getDay()
                ]
              }
            </Text>
            <TouchableOpacity
              style={[
                styles(theme).dateContainer,
                date === today && styles(theme).todayContainer,
              ]}
            >
              <Text
                style={[
                  styles(theme).dateText,
                  date === today && styles(theme).todayText,
                ]}
              >
                {date}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
      justifyContent: "flex-start",
      paddingHorizontal: theme.spacing.sm,
    },
    dayWrapper: {
      alignItems: "center",
      marginHorizontal: theme.spacing.sm,
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
