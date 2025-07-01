
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Text } from "react-native-paper";
import LogPeriodModal from "../components/LogPeriodModal";
import { useThemeContext } from "../components/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>(
    {}
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const loadSavedData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const savedData = await AsyncStorage.multiGet(keys);
        const newSelectedDates: { [key: string]: any } = {};
        savedData.forEach(([key, value]) => {
          newSelectedDates[key] = {
            selected: true,
            marked: true,
            selectedColor: theme.colors.primary,
          };
        });
        setSelectedDates(newSelectedDates);
      } catch (error) {
        console.error("Error loading data", error);
      }
    };
    loadSavedData();
  }, [fadeAnim, theme.colors.primary]);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    title: {
      ...theme.typography.brand,
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    calendarContainer: {
      width: Platform.OS === "web" ? "70%" : "100%",
      alignSelf: "center",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Period Calendar</Text>
      <Animated.View style={[styles.calendarContainer, { opacity: fadeAnim }]}>
        <Calendar
          markedDates={selectedDates}
          onDayPress={onDayPress}
          markingType={"multi-dot"}
          theme={{
            calendarBackground: theme.colors.background,
            textSectionTitleColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.white,
            todayTextColor: theme.colors.accent,
            dayTextColor: theme.colors.text,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            textMonthFontFamily: theme.fonts.title.family,
            textMonthFontSize: 32,
          }}
        />
      </Animated.View>
      <LogPeriodModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
      />
    </View>
  );
}
