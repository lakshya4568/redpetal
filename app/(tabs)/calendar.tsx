import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import { periodsAPI } from "../../services/api";
import LogPeriodModal from "../components/LogPeriodModal";
import { useThemeContext } from "../components/ThemeContext";

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dots?: { key: string; color: string }[];
  customStyles?: any;
}

export default function CalendarScreen() {
  const { theme } = useThemeContext();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>(
    {}
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<any>(null);

  // Fetch period data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPeriodData();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const loadPeriodData = async () => {
    try {
      setLoading(true);

      // Load period history
      const historyResponse = await periodsAPI.getHistory(12, 0);
      const cycles = historyResponse.cycles || [];

      // Load predictions
      const predictionsResponse = await periodsAPI.getPredictions();
      setPredictions(predictionsResponse.predictions);

      // Load symptoms and moods for the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const symptomsResponse = await periodsAPI.getSymptoms(
        threeMonthsAgo.toISOString().split("T")[0]
      );
      const symptoms = symptomsResponse.symptoms || [];

      const moodsResponse = await periodsAPI.getMoods(
        threeMonthsAgo.toISOString().split("T")[0]
      );
      const moods = moodsResponse.moods || [];

      // Create marked dates object
      const newMarkedDates: { [key: string]: MarkedDate } = {};

      // Mark period dates
      cycles.forEach((cycle: any) => {
        if (cycle.period_start_date) {
          const startDate = cycle.period_start_date;
          newMarkedDates[startDate] = {
            marked: true,
            selectedColor: theme.colors.error,
            customStyles: {
              container: {
                backgroundColor: theme.colors.error,
                borderRadius: 16,
              },
              text: {
                color: theme.colors.white,
                fontWeight: "bold",
              },
            },
          };

          // Mark period duration if end date exists
          if (cycle.period_end_date) {
            const start = new Date(cycle.period_start_date);
            const end = new Date(cycle.period_end_date);

            for (
              let d = new Date(start);
              d <= end;
              d.setDate(d.getDate() + 1)
            ) {
              const dateStr = d.toISOString().split("T")[0];
              newMarkedDates[dateStr] = {
                marked: true,
                selectedColor: theme.colors.error,
                customStyles: {
                  container: {
                    backgroundColor: theme.colors.errorLight,
                    borderRadius: 16,
                  },
                  text: {
                    color: theme.colors.text,
                    fontWeight: "bold",
                  },
                },
              };
            }
          }
        }
      });

      // Mark predicted next period
      if (predictions?.next_period_date) {
        const predictedDate = predictions.next_period_date;
        newMarkedDates[predictedDate] = {
          ...newMarkedDates[predictedDate],
          marked: true,
          customStyles: {
            container: {
              backgroundColor: theme.colors.warning,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: theme.colors.primary,
            },
            text: {
              color: theme.colors.white,
              fontWeight: "bold",
            },
          },
        };
      }

      // Mark fertile window
      if (predictions?.fertile_window) {
        const fertileStart = new Date(predictions.fertile_window.start);
        const fertileEnd = new Date(predictions.fertile_window.end);

        for (
          let d = new Date(fertileStart);
          d <= fertileEnd;
          d.setDate(d.getDate() + 1)
        ) {
          const dateStr = d.toISOString().split("T")[0];
          if (!newMarkedDates[dateStr]) {
            newMarkedDates[dateStr] = {
              marked: true,
              customStyles: {
                container: {
                  backgroundColor: theme.colors.success,
                  borderRadius: 16,
                  opacity: 0.6,
                },
                text: {
                  color: theme.colors.white,
                },
              },
            };
          }
        }
      }

      // Mark symptom days
      symptoms.forEach((symptom: any) => {
        const dateStr = symptom.date;
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { marked: true };
        }
        newMarkedDates[dateStr].dots = [
          ...(newMarkedDates[dateStr].dots || []),
          { key: "symptom", color: theme.colors.warning },
        ];
      });

      // Mark mood days
      moods.forEach((mood: any) => {
        const dateStr = mood.date;
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { marked: true };
        }
        newMarkedDates[dateStr].dots = [
          ...(newMarkedDates[dateStr].dots || []),
          { key: "mood", color: theme.colors.info },
        ];
      });

      setMarkedDates(newMarkedDates);
    } catch (error: any) {
      console.error("Error loading period data:", error);
      Alert.alert("Error", "Failed to load period data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPeriodData();
  };

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handlePeriodLogged = () => {
    // Refresh the calendar data
    loadPeriodData();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg,
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
    predictionContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.lg,
    },
    predictionTitle: {
      ...theme.typography.titleMedium,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    predictionText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    legendItem: {
      alignItems: "center",
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginBottom: theme.spacing.xs,
    },
    legendText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{
            ...theme.typography.bodyLarge,
            color: theme.colors.text,
            marginTop: theme.spacing.md,
          }}
        >
          Loading calendar...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Text style={styles.title}>Period Calendar</Text>

      <Animated.View style={[styles.calendarContainer, { opacity: fadeAnim }]}>
        <Calendar
          markedDates={markedDates}
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

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.colors.error }]}
          />
          <Text style={styles.legendText}>Period</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.colors.warning },
            ]}
          />
          <Text style={styles.legendText}>Predicted</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.colors.success },
            ]}
          />
          <Text style={styles.legendText}>Fertile</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.colors.info }]}
          />
          <Text style={styles.legendText}>Symptoms</Text>
        </View>
      </View>

      {/* Predictions */}
      {predictions && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionTitle}>Cycle Insights</Text>
          <Text style={styles.predictionText}>
            Next period predicted:{" "}
            {new Date(predictions.next_period_date).toLocaleDateString()}
          </Text>
          <Text style={styles.predictionText}>
            Average cycle length: {predictions.avg_cycle_length} days
          </Text>
          <Text style={styles.predictionText}>
            Average period length: {predictions.avg_period_length} days
          </Text>
          <Text style={styles.predictionText}>
            Fertile window:{" "}
            {new Date(predictions.fertile_window.start).toLocaleDateString()} -{" "}
            {new Date(predictions.fertile_window.end).toLocaleDateString()}
          </Text>
        </View>
      )}

      <LogPeriodModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        onPeriodLogged={handlePeriodLogged}
      />
    </ScrollView>
  );
}
