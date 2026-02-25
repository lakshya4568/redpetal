/**
 * HomeScreen — Red Petal Home Dashboard
 * Redesigned to match Stitch "Modern Home" design
 * Features: PetalTracker, Quick Actions, Daily Insights, Today's Tip, Weekly Calendar
 */

import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { periodsAPI } from "../../services/api";
import { useAuth } from "../../services/auth";
import PetalTracker from "../components/PetalTracker";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import TodayTip from "../components/TodayTip";

// Static insights (could be backend-driven in future)
const INSIGHTS = [
  {
    id: "1",
    category: "Wellness",
    title: "Reducing Cramps naturally",
    excerpt: "Explore herbal teas and gentle movement techniques.",
    image: null,
  },
  {
    id: "2",
    category: "Nutrition",
    title: "The power of Magnesium",
    excerpt: "Why this mineral is key for your hormonal balance.",
    image: null,
  },
  {
    id: "3",
    category: "Fitness",
    title: "Cycle-synced workouts",
    excerpt: "Adjust your exercise routine to your phase.",
    image: null,
  },
];

// Helper to compute cycle info from predictions/history
function computeCycleInfo(predictions: any) {
  if (!predictions) {
    return { cycleDay: 0, phase: "Unknown", fertilityLevel: "Unknown" };
  }

  const avgCycleLength = predictions.avg_cycle_length || 28;
  const nextPeriod = predictions.next_period_start;

  if (!nextPeriod) {
    return { cycleDay: 0, phase: "Unknown", fertilityLevel: "Unknown" };
  }

  const today = new Date();
  const nextStart = new Date(nextPeriod);
  const daysUntilNext = Math.ceil(
    (nextStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay = Math.max(1, avgCycleLength - daysUntilNext);

  // Determine phase
  let phase = "Menstrual";
  let fertilityLevel = "Low";
  const periodLength = predictions.avg_period_length || 5;

  if (cycleDay <= periodLength) {
    phase = "Menstrual";
    fertilityLevel = "Low";
  } else if (cycleDay <= 13) {
    phase = "Follicular";
    fertilityLevel = cycleDay >= 10 ? "High" : "Medium";
  } else if (cycleDay <= 16) {
    phase = "Ovulation";
    fertilityLevel = "Peak";
  } else {
    phase = "Luteal";
    fertilityLevel = "Low";
  }

  return { cycleDay, phase, fertilityLevel };
}

export default function HomeScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isGuest = user?.id === "guest";

  // State for cycle data
  const [cycleInfo, setCycleInfo] = useState({
    cycleDay: 0,
    phase: "Loading...",
    fertilityLevel: "...",
  });
  const [weekDays, setWeekDays] = useState<
    { day: string; date: number; isToday?: boolean }[]
  >([]);

  // Build week days from current date
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        day: dayNames[i],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      });
    }
    setWeekDays(days);
  }, []);

  // Fetch cycle predictions
  useFocusEffect(
    useCallback(() => {
      if (isGuest) {
        setCycleInfo({ cycleDay: 0, phase: "Sign in to track", fertilityLevel: "—" });
        return;
      }
      loadCycleData();
    }, [isGuest])
  );

  const loadCycleData = async () => {
    try {
      const predictionsResponse = await periodsAPI.getPredictions();
      const info = computeCycleInfo(predictionsResponse.predictions);
      setCycleInfo(info);
    } catch (error) {
      console.error("Error loading cycle data:", error);
      setCycleInfo({ cycleDay: 0, phase: "No data yet", fertilityLevel: "—" });
    }
  };

  const displayName = user?.first_name || user?.username || "there";
  const currentMonthYear = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Phase-based insight text
  const insightText =
    cycleInfo.phase === "Loading..." || cycleInfo.phase === "No data yet"
      ? "Log your period to get personalized cycle insights."
      : cycleInfo.phase === "Sign in to track"
        ? "Sign in to track your cycle and get insights."
        : `Your fertility is ${cycleInfo.fertilityLevel.toLowerCase()} today. A great time for ${cycleInfo.phase === "Follicular"
          ? "light yoga and nourishing greens"
          : cycleInfo.phase === "Ovulation"
            ? "high-intensity workouts"
            : cycleInfo.phase === "Luteal"
              ? "rest and gentle stretching"
              : "self-care and rest"
        }.`;

  const renderInsightCard = useCallback(
    ({ item, index }: { item: typeof INSIGHTS[0]; index: number }) => (
      <Animated.View
        entering={FadeInRight.delay(index * 100).duration(400)}
        style={styles(theme).insightCard}
      >
        <View style={styles(theme).insightImagePlaceholder}>
          <FontAwesome
            name={
              item.category === "Wellness"
                ? "heartbeat"
                : item.category === "Nutrition"
                  ? "leaf"
                  : "bicycle"
            }
            size={32}
            color={theme.colors.primary + "60"}
          />
        </View>
        <View style={styles(theme).insightContent}>
          <Text style={styles(theme).insightCategory}>{item.category}</Text>
          <Text style={styles(theme).insightTitle}>{item.title}</Text>
          <Text style={styles(theme).insightExcerpt} numberOfLines={1}>
            {item.excerpt}
          </Text>
        </View>
      </Animated.View>
    ),
    [theme]
  );

  return (
    <View style={[styles(theme).screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles(theme).scrollContent}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          style={styles(theme).header}
        >
          <View style={styles(theme).headerLeft}>
            <View style={styles(theme).profileCircle}>
              <FontAwesome name="user" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles(theme).brandText}>RED PETAL</Text>
          </View>
          <TouchableOpacity style={styles(theme).notificationBtn}>
            <FontAwesome
              name="bell-o"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Greeting */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles(theme).greetingSection}
        >
          <Text style={styles(theme).greetingHello}>Hello,</Text>
          <Text style={styles(theme).greetingName}>{displayName}</Text>
        </Animated.View>

        {/* Petal Tracker */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <PetalTracker
            cycleDay={cycleInfo.cycleDay}
            phase={cycleInfo.phase}
            fertilityLevel={cycleInfo.fertilityLevel}
          />
        </Animated.View>

        {/* Insight text */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles(theme).insightTextSection}
        >
          <Text style={styles(theme).insightMainText}>
            {insightText}
          </Text>
        </Animated.View>

        {/* Quick Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles(theme).quickActions}
        >
          <TouchableOpacity
            style={styles(theme).logSymptomsBtn}
            onPress={() => router.push("/features/log")}
          >
            <FontAwesome name="plus-circle" size={18} color={theme.colors.primary} />
            <Text style={styles(theme).logSymptomsText}>Log Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).moodBtn}
            onPress={() => router.push("/features/log")}
          >
            <FontAwesome
              name="smile-o"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Access Cards */}
        <Animated.View
          entering={FadeInDown.delay(450).duration(500)}
          style={styles(theme).quickAccessGrid}
        >
          <TouchableOpacity
            style={styles(theme).quickAccessCard}
            onPress={() => router.push("/features/log")}
          >
            <View style={styles(theme).quickAccessIcon}>
              <FontAwesome
                name="smile-o"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles(theme).quickAccessLabel}>Daily Mood</Text>
            <Text style={styles(theme).quickAccessHint}>Not logged</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).quickAccessCard}
            onPress={() => router.push("/features/log")}
          >
            <View style={styles(theme).quickAccessIcon}>
              <FontAwesome
                name="heart-o"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles(theme).quickAccessLabel}>Symptoms</Text>
            <Text style={styles(theme).quickAccessHint}>Track now</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Today's Tip */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <TodayTip title="The benefits of Magnesium during your Luteal phase" />
        </Animated.View>

        {/* Daily Insights */}
        <Animated.View
          entering={FadeInDown.delay(550).duration(500)}
          style={styles(theme).insightsSection}
        >
          <View style={styles(theme).sectionHeader}>
            <Text style={styles(theme).sectionTitle}>Daily Insights</Text>
            <TouchableOpacity>
              <Text style={styles(theme).seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={INSIGHTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderInsightCard}
            contentContainerStyle={{ gap: 12 }}
          />
        </Animated.View>

        {/* Weekly Calendar Preview */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles(theme).calendarPreview}
        >
          <View style={styles(theme).sectionHeader}>
            <Text style={styles(theme).sectionTitle}>Upcoming</Text>
            <Text style={[styles(theme).seeAllText, { fontWeight: "500" }]}>
              {currentMonthYear}
            </Text>
          </View>
          <View style={styles(theme).weekRow}>
            {weekDays.map((d) => (
              <View key={d.date} style={styles(theme).weekDay}>
                <Text
                  style={[
                    styles(theme).weekDayLabel,
                    d.isToday && { color: theme.colors.primary, fontWeight: "700" },
                  ]}
                >
                  {d.day}
                </Text>
                <View
                  style={[
                    styles(theme).weekDayCircle,
                    d.isToday && styles(theme).weekDayCircleToday,
                  ]}
                >
                  <Text
                    style={[
                      styles(theme).weekDayDate,
                      d.isToday && { color: "#FFF", fontWeight: "700" },
                    ]}
                  >
                    {d.date}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    profileCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.primary + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    brandText: {
      fontSize: 13,
      fontFamily: theme.fonts.body.family,
      fontWeight: "600",
      letterSpacing: 2,
      color: theme.colors.textSecondary,
      textTransform: "uppercase",
    },
    notificationBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    greetingSection: {
      paddingVertical: 16,
    },
    greetingHello: {
      fontSize: 44,
      fontFamily: theme.fonts.title.family,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 52,
    },
    greetingName: {
      fontSize: 44,
      fontFamily: theme.fonts.subtitle.family,
      color: theme.colors.primary,
      lineHeight: 52,
    },
    insightTextSection: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    insightMainText: {
      fontSize: 16,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textSecondary,
      lineHeight: 26,
      textAlign: "center",
    },
    quickActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
      justifyContent: "center",
    },
    logSymptomsBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.primary + "15",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 999,
    },
    logSymptomsText: {
      fontSize: 14,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    moodBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    quickAccessGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    quickAccessCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    quickAccessIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + "10",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    quickAccessLabel: {
      fontSize: 13,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    quickAccessHint: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textMuted,
    },
    insightsSection: {
      marginTop: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 17,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
    },
    seeAllText: {
      fontSize: 13,
      fontFamily: theme.fonts.body.family,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    insightCard: {
      width: 240,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    insightImagePlaceholder: {
      height: 120,
      backgroundColor: theme.colors.overlay,
      alignItems: "center",
      justifyContent: "center",
    },
    insightContent: {
      padding: 14,
    },
    insightCategory: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.primary,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    insightTitle: {
      fontSize: 15,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: 4,
    },
    insightExcerpt: {
      fontSize: 12,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textMuted,
    },
    calendarPreview: {
      marginTop: 24,
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    weekDay: {
      alignItems: "center",
      gap: 8,
    },
    weekDayLabel: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textMuted,
    },
    weekDayCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    weekDayCircleToday: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    weekDayDate: {
      fontSize: 14,
      fontFamily: theme.fonts.body.family,
      fontWeight: "500",
      color: theme.colors.text,
    },
  });
