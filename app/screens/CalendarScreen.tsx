import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import LogPeriodModal from '../components/LogPeriodModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarScreen() {
  const [selectedDates, setSelectedDates] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const savedData = await AsyncStorage.multiGet(keys);
        const newSelectedDates = {};
        savedData.forEach(([key, value]) => {
          newSelectedDates[key] = { selected: true, marked: true, selectedColor: 'blue' };
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
      <Calendar
        markedDates={selectedDates}
        onDayPress={onDayPress}
        markingType={'multi-dot'}
      />
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
});
