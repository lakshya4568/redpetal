/**
 * CalendarScreen - Redesigned for RedPetal V2
 * Clean calendar view with smooth transitions and animated legends
 */

import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { periodsAPI } from "../../services/api";
import LogPeriodModal from "../components/LogPeriodModal";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import { responsive, springConfigs, timingConfigs } from "../utils/animations";

interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  selectedColor?: string;
  dots?: { key: string; color: string }[];
  customStyles?: Record<string, unknown>;
}

// Memoized Legend Item
const LegendItem = React.memo(
  ({
    color,
    label,
    index,
    theme,
  }: {
    color: string;
    label: string;
    index: number;
    theme: AppTheme;
  }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(10);

    useEffect(() => {
      const delay = index * 80;
      opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
      translateY.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    }, [index, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View style={[styles(theme).legendItem, animatedStyle]}>
        <View style={[styles(theme).legendDot, { backgroundColor: color }]} />
        <Text style={styles(theme).legendText}>{label}</Text>
      </Animated.View>
    );
  }
);

LegendItem.displayName = "LegendItem";

// Memoized Info Card
const InfoCard = React.memo(
  ({
    label,
    value,
    index,
    theme,
  }: {
    label: string;
    value: string;
    index: number;
    theme: AppTheme;
  }) => {
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
      const delay = 200 + index * 100;
      scale.value = withDelay(delay, withSpring(1, springConfigs.bouncy));
      opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
    }, [index, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <Animated.View style={[styles(theme).infoCard, animatedStyle]}>
        <Text style={styles(theme).infoValue}>{value}</Text>
        <Text style={styles(theme).infoLabel}>{label}</Text>
      </Animated.View>
    );
  }
);

InfoCard.displayName = "InfoCard";

export default function CalendarScreen() {
  const { theme } = useThemeContext();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: MarkedDate }>(
    {}
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Animation values
  const titleOpacity = useSharedValue(0);
  const calendarOpacity = useSharedValue(0);
  const calendarScale = useSharedValue(0.95);

  // Fetch period data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPeriodData();
    }, [])
  );

  // Animate on mount
  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 400 });
    calendarOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    calendarScale.value = withDelay(200, withSpring(1, springConfigs.gentle));
  }, [titleOpacity, calendarOpacity, calendarScale]);

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
      cycles.forEach((cycle: Record<string, unknown>) => {
        if (cycle.period_start_date) {
          const startDate = cycle.period_start_date as string;
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
            const start = new Date(cycle.period_start_date as string);
            const end = new Date(cycle.period_end_date as string);

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

      // Mark symptom days
      symptoms.forEach((symptom: Record<string, unknown>) => {
        const dateStr = symptom.date as string;
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { marked: true };
        }
        newMarkedDates[dateStr].dots = [
          ...(newMarkedDates[dateStr].dots || []),
          { key: "symptom", color: theme.colors.warning },
        ];
      });

      // Mark mood days
      moods.forEach((mood: Record<string, unknown>) => {
        const dateStr = mood.date as string;
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = { marked: true };
        }
        newMarkedDates[dateStr].dots = [
          ...(newMarkedDates[dateStr].dots || []),
          { key: "mood", color: theme.colors.info },
        ];
      });

      setMarkedDates(newMarkedDates);
    } catch (error) {
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
    loadPeriodData();
  };

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      {
        translateY: interpolate(
          titleOpacity.value,
          [0, 1],
          [-20, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: calendarOpacity.value,
    transform: [{ scale: calendarScale.value }],
  }));

  const legendItems = [
    { color: theme.colors.error, label: "Period" },
    { color: theme.colors.warning, label: "Predicted" },
    { color: theme.colors.success, label: "Fertile" },
    { color: theme.colors.info, label: "Symptoms" },
  ];

  if (loading) {
    return (
      <View style={styles(theme).loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles(theme).loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles(theme).container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Title */}
      <Animated.Text style={[styles(theme).title, titleAnimatedStyle]}>
        Period Calendar
      </Animated.Text>

      {/* Calendar */}
      <Animated.View
        style={[styles(theme).calendarContainer, calendarAnimatedStyle]}
      >
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
            textMonthFontFamily: theme.fonts.subtitle.family,
            textMonthFontSize: responsive.fs(24),
            textDayFontFamily: theme.fonts.body.family,
            textDayFontSize: responsive.fs(14),
            textDayHeaderFontFamily: theme.fonts.body.family,
            textDayHeaderFontSize: responsive.fs(12),
          }}
          style={styles(theme).calendar}
        />
      </Animated.View>

      {/* Legend */}
      <View style={styles(theme).legendContainer}>
        {legendItems.map((item, index) => (
          <LegendItem
            key={item.label}
            color={item.color}
            label={item.label}
            index={index}
            theme={theme}
          />
        ))}
      </View>

      {/* Cycle Insights */}
      {predictions && (
        <View style={styles(theme).insightsContainer}>
          <Text style={styles(theme).insightsTitle}>Cycle Insights</Text>
          <View style={styles(theme).infoCardsRow}>
            <InfoCard
              label="Avg. Cycle"
              value={`${
                (predictions as Record<string, unknown>).avg_cycle_length || 28
              } days`}
              index={0}
              theme={theme}
            />
            <InfoCard
              label="Avg. Period"
              value={`${
                (predictions as Record<string, unknown>).avg_period_length || 5
              } days`}
              index={1}
              theme={theme}
            />
          </View>
        </View>
      )}

      {/* Bottom spacer for tab bar */}
      <View style={styles(theme).bottomSpacer} />

      <LogPeriodModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        selectedDate={selectedDate}
        onPeriodLogged={handlePeriodLogged}
      />
    </ScrollView>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(16),
      color: theme.colors.text,
      marginTop: responsive.sp(16),
    },
    title: {
      fontFamily: theme.fonts.title.family,
      fontSize: responsive.fs(48),
      color: theme.colors.primary,
      textAlign: "center",
      paddingTop:
        Platform.OS === "android" ? responsive.sp(50) : responsive.sp(60),
      paddingBottom: responsive.sp(16),
    },
    calendarContainer: {
      marginHorizontal: responsive.sp(16),
      backgroundColor: theme.colors.surface,
      borderRadius: responsive.sp(20),
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    calendar: {
      paddingBottom: responsive.sp(16),
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: responsive.sp(20),
      marginHorizontal: responsive.sp(16),
      paddingVertical: responsive.sp(16),
      paddingHorizontal: responsive.sp(12),
      backgroundColor: theme.colors.surface,
      borderRadius: responsive.sp(16),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    legendItem: {
      alignItems: "center",
    },
    legendDot: {
      width: responsive.sp(12),
      height: responsive.sp(12),
      borderRadius: responsive.sp(6),
      marginBottom: responsive.sp(6),
    },
    legendText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(11),
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    insightsContainer: {
      marginTop: responsive.sp(24),
      marginHorizontal: responsive.sp(16),
      padding: responsive.sp(20),
      backgroundColor: theme.colors.surface,
      borderRadius: responsive.sp(20),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    insightsTitle: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(18),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: responsive.sp(16),
    },
    infoCardsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    infoCard: {
      alignItems: "center",
      paddingVertical: responsive.sp(16),
      paddingHorizontal: responsive.sp(24),
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: responsive.sp(16),
      minWidth: responsive.wp(35),
    },
    infoValue: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(20),
      fontWeight: "700",
      color: theme.colors.primary,
      marginBottom: responsive.sp(4),
    },
    infoLabel: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(12),
      color: theme.colors.textSecondary,
    },
    bottomSpacer: {
      height: responsive.sp(120),
    },
  });
