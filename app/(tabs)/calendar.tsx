/**
 * CalendarScreen — Period Cycle Screen
 * Matches the Stitch "Red Petal Period Cycle" design
 * Circular ring tracker + week row + Health Insights + Energy/Mood cards
 * Connected to periodsAPI for real data
 */

import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { periodsAPI } from "../../services/api";
import { useAuth } from "../../services/auth";
import LogPeriodModal from "../components/LogPeriodModal";
import { AppTheme, useThemeContext } from "../components/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ─── helpers ────────────────────────────────────────────── */

function computeCycleInfo(predictions: any) {
  if (!predictions) {
    return { cycleDay: 0, phase: "Unknown", fertilityLevel: "Low", daysUntilPeriod: 0, totalCycleDays: 28 };
  }

  const avgCycleLength = predictions.avg_cycle_length || 28;
  const nextPeriod = predictions.next_period_start;

  if (!nextPeriod) {
    return { cycleDay: 0, phase: "Unknown", fertilityLevel: "Low", daysUntilPeriod: 0, totalCycleDays: avgCycleLength };
  }

  const today = new Date();
  const nextStart = new Date(nextPeriod);
  const daysUntilNext = Math.max(
    0,
    Math.ceil((nextStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );
  const cycleDay = Math.max(1, avgCycleLength - daysUntilNext);

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

  return { cycleDay, phase, fertilityLevel, daysUntilPeriod: daysUntilNext, totalCycleDays: avgCycleLength };
}

const PHASE_INSIGHTS: Record<string, { title: string; body: string; icon: string }> = {
  Menstrual: {
    title: "Rest and recover",
    body: "During your menstrual phase, focus on gentle movement and iron-rich foods. Your body is renewing — prioritize sleep and hydration.",
    icon: "bed",
  },
  Follicular: {
    title: "Increase iron intake this week",
    body: "During your follicular phase, focus on replenishing minerals. Try adding spinach, lentils, or lean proteins to your meals to support rising energy levels.",
    icon: "cutlery",
  },
  Ovulation: {
    title: "Peak energy — stay active",
    body: "Your estrogen is high. This is a great time for socialising, high-intensity workouts, and tackling challenging tasks.",
    icon: "flash",
  },
  Luteal: {
    title: "Wind down gently",
    body: "Progesterone rises during the luteal phase. Opt for complex carbs, magnesium-rich snacks, and calming routines to ease PMS symptoms.",
    icon: "moon-o",
  },
};

const MOOD_MAP: Record<string, string> = {
  Menstrual: "Reflective",
  Follicular: "Social",
  Ovulation: "Energised",
  Luteal: "Quiet",
};

const ENERGY_MAP: Record<string, string> = {
  Menstrual: "Low",
  Follicular: "Rising",
  Ovulation: "High Peak",
  Luteal: "Declining",
};

function buildWeekDays(): { day: string; date: number; isToday: boolean }[] {
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const dow = today.getDay() || 7; // Mon=1 … Sun=7
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow - 1));

  return names.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day: name, date: d.getDate(), isToday: d.toDateString() === today.toDateString() };
  });
}

/* ─── circular ring sub-component ────────────────────────── */

function CycleRing({
  cycleDay,
  phase,
  totalCycleDays,
  theme,
}: {
  cycleDay: number;
  phase: string;
  totalCycleDays: number;
  theme: AppTheme;
}) {
  const ringSize = Math.min(SCREEN_WIDTH * 0.4, 160);
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(cycleDay / totalCycleDays, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[ringStyles(theme).container, { width: ringSize, height: ringSize }]}>
      <Svg width={ringSize} height={ringSize} style={ringStyles(theme).svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="1" />
            <Stop offset="1" stopColor={theme.colors.accent} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={theme.colors.primary + "15"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${ringSize / 2}, ${ringSize / 2}`}
        />
      </Svg>
      <View style={ringStyles(theme).center}>
        <Text style={ringStyles(theme).dayLabel}>Day</Text>
        <Text style={ringStyles(theme).dayNumber}>{cycleDay || "—"}</Text>
        <View style={ringStyles(theme).phaseBadge}>
          <Text style={ringStyles(theme).phaseText}>{phase.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
}

const ringStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", position: "relative" },
    svg: { position: "absolute" },
    center: { alignItems: "center", justifyContent: "center" },
    dayLabel: { fontSize: 11, fontFamily: theme.fonts.body.family, fontWeight: "500", color: theme.colors.textSecondary, letterSpacing: 1 },
    dayNumber: { fontSize: 40, fontFamily: theme.fonts.title.family, fontWeight: "700", color: theme.colors.text, lineHeight: 46 },
    phaseBadge: { backgroundColor: theme.colors.primary + "12", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 2 },
    phaseText: { fontSize: 8, fontFamily: theme.fonts.body.family, fontWeight: "700", color: theme.colors.primary, letterSpacing: 2 },
  });

/* ─── main screen ────────────────────────────────────────── */

export default function CalendarScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isGuest = user?.id === "guest";

  const [loading, setLoading] = useState(true);
  const [cycleInfo, setCycleInfo] = useState({
    cycleDay: 0,
    phase: "Loading...",
    fertilityLevel: "Low",
    daysUntilPeriod: 0,
    totalCycleDays: 28,
  });
  const [weekDays] = useState(buildWeekDays);
  const [showLogModal, setShowLogModal] = useState(false);

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const loadCycleData = useCallback(async () => {
    if (isGuest) {
      setCycleInfo({ cycleDay: 0, phase: "Sign in", fertilityLevel: "—", daysUntilPeriod: 0, totalCycleDays: 28 });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const predictions = await periodsAPI.getPredictions();
      setCycleInfo(computeCycleInfo(predictions));
    } catch {
      setCycleInfo({ cycleDay: 0, phase: "No data", fertilityLevel: "—", daysUntilPeriod: 0, totalCycleDays: 28 });
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useFocusEffect(
    useCallback(() => {
      loadCycleData();
    }, [loadCycleData])
  );

  const insight = PHASE_INSIGHTS[cycleInfo.phase] || PHASE_INSIGHTS.Follicular;
  const moodLabel = MOOD_MAP[cycleInfo.phase] || "Balanced";
  const energyLabel = ENERGY_MAP[cycleInfo.phase] || "Moderate";

  if (loading) {
    return (
      <View style={[styles(theme).screen, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles(theme).screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles(theme).scroll}>
        {/* Month header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles(theme).monthHeader}>
          <Text style={styles(theme).monthLabel}>{currentMonth.toUpperCase()}</Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={styles(theme).title}>My Cycle</Text>
        </Animated.View>

        {/* Hero: ring + next period info */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles(theme).heroRow}>
          <CycleRing
            cycleDay={cycleInfo.cycleDay}
            phase={cycleInfo.phase}
            totalCycleDays={cycleInfo.totalCycleDays}
            theme={theme}
          />
          <View style={styles(theme).nextPeriodSide}>
            <Text style={styles(theme).nextPeriodText}>Next{"\n"}Period</Text>
            {cycleInfo.daysUntilPeriod > 0 ? (
              <Text style={styles(theme).nextPeriodDays}>
                in <Text style={styles(theme).daysHighlight}>{cycleInfo.daysUntilPeriod} Days</Text>
              </Text>
            ) : (
              <Text style={styles(theme).nextPeriodDays}>
                <Text style={styles(theme).daysHighlight}>Soon</Text>
              </Text>
            )}
            <Text style={styles(theme).predictability}>85% predictability</Text>
          </View>
        </Animated.View>

        {/* Week day row */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles(theme).weekRow}>
          {weekDays.map((wd) => (
            <View key={wd.day} style={styles(theme).weekDayCol}>
              <Text style={[styles(theme).weekDayName, wd.isToday && styles(theme).weekDayNameToday]}>{wd.day}</Text>
              <View style={[styles(theme).weekDayCircle, wd.isToday && styles(theme).weekDayCircleToday]}>
                <Text style={[styles(theme).weekDayDate, wd.isToday && styles(theme).weekDayDateToday]}>{wd.date}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Health Insights card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles(theme).insightCard}>
          <View style={styles(theme).insightHeader}>
            <Text style={styles(theme).insightTitle}>Health Insights</Text>
            <View style={styles(theme).phaseChip}>
              <Text style={styles(theme).phaseChipText}>{cycleInfo.phase.toUpperCase()} PHASE</Text>
            </View>
          </View>
          <View style={styles(theme).insightBody}>
            <FontAwesome name={insight.icon as any} size={20} color={theme.colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles(theme).insightAdviceTitle}>{insight.title}</Text>
              <Text style={styles(theme).insightAdviceBody}>{insight.body}</Text>
              <TouchableOpacity>
                <Text style={styles(theme).readMore}>READ MORE &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Energy + Mood cards */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles(theme).emRow}>
          <View style={styles(theme).emCard}>
            <FontAwesome name="bolt" size={20} color={theme.colors.primary} />
            <Text style={styles(theme).emLabel}>ENERGY</Text>
            <Text style={styles(theme).emValue}>{energyLabel}</Text>
          </View>
          <View style={styles(theme).emCard}>
            <FontAwesome name="heart" size={20} color={theme.colors.primary} />
            <Text style={styles(theme).emLabel}>MOOD</Text>
            <Text style={styles(theme).emValue}>{moodLabel}</Text>
          </View>
        </Animated.View>

        {/* Log period CTA */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <TouchableOpacity
            style={styles(theme).logBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (isGuest) return;
              setShowLogModal(true);
            }}
          >
            <FontAwesome name="plus-circle" size={18} color="#FFF" />
            <Text style={styles(theme).logBtnText}>Log Period</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <LogPeriodModal
        visible={showLogModal}
        onClose={() => setShowLogModal(false)}
        onPeriodLogged={() => {
          setShowLogModal(false);
          loadCycleData();
        }}
      />
    </View>
  );
}

/* ─── styles ─────────────────────────────────────────────── */

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    scroll: { paddingHorizontal: 24 },

    /* month header */
    monthHeader: { marginTop: 12 },
    monthLabel: {
      fontSize: 11,
      fontFamily: theme.fonts.body.family,
      fontWeight: "600",
      letterSpacing: 3,
      color: theme.colors.primary,
    },

    /* title */
    title: {
      fontSize: 32,
      fontFamily: theme.fonts.title.family,
      color: theme.colors.text,
      marginTop: 4,
      marginBottom: 20,
    },

    /* hero */
    heroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 24,
      marginBottom: 28,
    },
    nextPeriodSide: { flex: 1 },
    nextPeriodText: {
      fontSize: 24,
      fontFamily: theme.fonts.subtitle.family,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 30,
    },
    nextPeriodDays: {
      fontSize: 22,
      fontFamily: theme.fonts.subtitle.family,
      fontWeight: "300",
      color: theme.colors.text,
      lineHeight: 28,
    },
    daysHighlight: {
      color: theme.colors.primary,
      fontWeight: "600",
      fontStyle: "italic",
    },
    predictability: {
      fontSize: 12,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textMuted,
      marginTop: 8,
    },

    /* week row */
    weekRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
    },
    weekDayCol: { alignItems: "center", gap: 6, flex: 1 },
    weekDayName: {
      fontSize: 10,
      fontFamily: theme.fonts.body.family,
      fontWeight: "500",
      color: theme.colors.textMuted,
      textTransform: "uppercase",
    },
    weekDayNameToday: { color: theme.colors.primary, fontWeight: "700" },
    weekDayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    weekDayCircleToday: {
      backgroundColor: theme.colors.primary,
    },
    weekDayDate: {
      fontSize: 13,
      fontFamily: theme.fonts.body.family,
      fontWeight: "600",
      color: theme.colors.text,
    },
    weekDayDateToday: { color: "#FFFFFF" },

    /* insight card */
    insightCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    insightHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    insightTitle: {
      fontSize: 16,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
    },
    phaseChip: {
      backgroundColor: theme.colors.primary + "12",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    phaseChipText: {
      fontSize: 9,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      letterSpacing: 1.5,
      color: theme.colors.primary,
    },
    insightBody: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    insightAdviceTitle: {
      fontSize: 15,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 6,
    },
    insightAdviceBody: {
      fontSize: 13,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    readMore: {
      fontSize: 12,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.primary,
      marginTop: 10,
      letterSpacing: 0.5,
    },

    /* energy/mood row */
    emRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    emCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 16,
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    emLabel: {
      fontSize: 9,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      letterSpacing: 2,
      color: theme.colors.textMuted,
    },
    emValue: {
      fontSize: 15,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.text,
    },

    /* log cta */
    logBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    logBtnText: {
      fontSize: 15,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
