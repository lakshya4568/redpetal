import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import LogPeriodModal from '../components/LogPeriodModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export default function CalendarScreen() {
  const [selectedDates, setSelectedDates] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
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
        const newSelectedDates = {};
        savedData.forEach(([key, value]) => {
          newSelectedDates[key] = { selected: true, marked: true, selectedColor: theme.colors.primary };
        });
        setSelectedDates(newSelectedDates);
      } catch (error) {
        console.error('Error loading data', error);
      }
    };
    loadSavedData();
  }, []);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Period Calendar</Text>
      <Animated.View style={[styles.calendarContainer, { opacity: fadeAnim }]}>
        <Calendar
          markedDates={selectedDates}
          onDayPress={onDayPress}
          markingType={'multi-dot'}
          theme={{
            calendarBackground: theme.colors.background,
            textSectionTitleColor: theme.colors.primary,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.white,
            todayTextColor: theme.colors.accent,
            dayTextColor: theme.colors.text,
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.primary,
            textMonthFontFamily: theme.fonts.cursive,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: 48,
    fontFamily: theme.fonts.cursive,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  calendarContainer: {
    width: Platform.OS === 'web' ? '70%' : '100%',
    alignSelf: 'center',
  },
});
