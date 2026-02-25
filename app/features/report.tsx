/**
 * MonthlyReportScreen — Monthly cycle/symptom report
 * Matches the Stitch "Red Petal Monthly Report" design
 * Connected to GET /api/reports/monthly
 */

import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
    Defs,
    Path,
    Stop,
    LinearGradient as SvgGrad,
} from "react-native-svg";
import { reportsAPI } from "../../services/api";
import { useAuth } from "../../services/auth";
import SymptomBar from "../components/SymptomBar";
import { AppTheme, useThemeContext } from "../components/ThemeContext";

interface ReportData {
    month: string;
    cycle: {
        cycleLength: number;
        periodLength: number;
        startDate: string;
        endDate: string;
    } | null;
    symptoms: { type: string; count: number }[];
    moods: { mood: string; count: number }[];
    flowDistribution: Record<string, number>;
    totalLogDays: number;
    dailyLogs: any[];
}

function EnergyChart({
    theme,
    dailyLogs,
}: {
    theme: AppTheme;
    dailyLogs: any[];
}) {
    const width = 300;
    const height = 120;

    // Build chart from daily logs energy (if available), else fallback to a smooth curve
    let chartPath: string;
    if (dailyLogs && dailyLogs.length >= 3) {
        const points = dailyLogs.map((log: any, i: number) => {
            // Map mood to energy: happy=high, sad=low, etc
            const moodEnergy: Record<string, number> = {
                happy: 0.15,
                calm: 0.3,
                neutral: 0.5,
                anxious: 0.6,
                sad: 0.75,
                angry: 0.85,
            };
            const y = (moodEnergy[log.mood] || 0.5) * height;
            const x = (i / (dailyLogs.length - 1)) * width;
            return `${x} ${y}`;
        });
        chartPath = `M${points.join(" L")}`;
    } else {
        chartPath = `M0 ${height * 0.8} L${width * 0.1} ${height * 0.7} L${width * 0.2} ${height * 0.4} L${width * 0.3} ${height * 0.2} L${width * 0.4} ${height * 0.45} L${width * 0.5} ${height * 0.6} L${width * 0.6} ${height * 0.3} L${width * 0.7} ${height * 0.1} L${width * 0.8} ${height * 0.5} L${width * 0.9} ${height * 0.85} L${width} ${height * 0.9}`;
    }
    const areaPath = `${chartPath} L${width} ${height} L0 ${height} Z`;

    return (
        <View style={{ alignItems: "center" }}>
            <Svg width={width} height={height}>
                <Defs>
                    <SvgGrad id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop
                            offset="0"
                            stopColor={theme.colors.primary}
                            stopOpacity="0.2"
                        />
                        <Stop
                            offset="1"
                            stopColor={theme.colors.primary}
                            stopOpacity="0"
                        />
                    </SvgGrad>
                </Defs>
                <Path d={areaPath} fill="url(#areaGrad)" />
                <Path
                    d={chartPath}
                    fill="none"
                    stroke={theme.colors.primary}
                    strokeWidth="2.5"
                />
            </Svg>
            <View style={chartLabelStyles(theme).row}>
                <Text style={chartLabelStyles(theme).label}>Day 1</Text>
                <Text style={chartLabelStyles(theme).label}>Day 7</Text>
                <Text style={chartLabelStyles(theme).label}>Day 14</Text>
                <Text style={chartLabelStyles(theme).label}>Day 21</Text>
                <Text style={chartLabelStyles(theme).label}>Day 28</Text>
            </View>
        </View>
    );
}

const chartLabelStyles = (theme: AppTheme) =>
    StyleSheet.create({
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: 300,
            marginTop: 8,
        },
        label: {
            fontSize: 9,
            fontFamily: theme.fonts.body.family,
            color: theme.colors.textMuted,
            letterSpacing: 0.5,
            textTransform: "uppercase",
        },
    });

export default function MonthlyReportScreen() {
    const { theme } = useThemeContext();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const isGuest = user?.id === "guest";

    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<ReportData | null>(null);

    // Month navigation state
    const [selectedYear, setSelectedYear] = useState(
        new Date().getFullYear()
    );
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
    );

    const loadReport = useCallback(async () => {
        if (isGuest) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await reportsAPI.getMonthly(selectedYear, selectedMonth);
            setReport(data);
        } catch (error) {
            console.error("Error loading report:", error);
            setReport(null);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedMonth, isGuest]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    const navigateMonth = (direction: -1 | 1) => {
        let newMonth = selectedMonth + direction;
        let newYear = selectedYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    // Computed summary values
    const cycleLength = report?.cycle?.cycleLength
        ? `${report.cycle.cycleLength} Days`
        : "—";
    const periodDuration = report?.cycle?.periodLength
        ? `${report.cycle.periodLength} Days`
        : "—";

    // Determine avg flow from flow distribution
    let avgFlow = "—";
    if (report?.flowDistribution) {
        const entries = Object.entries(report.flowDistribution);
        if (entries.length > 0) {
            entries.sort((a, b) => b[1] - a[1]);
            avgFlow =
                entries[0][0].charAt(0).toUpperCase() + entries[0][0].slice(1);
        }
    }

    // Symptoms for bars
    const maxSymptomCount =
        report?.symptoms && report.symptoms.length > 0
            ? Math.max(...report.symptoms.map((s) => s.count))
            : 15;
    const symptomBars = (report?.symptoms || []).slice(0, 5);

    if (isGuest) {
        return (
            <View
                style={[
                    styles(theme).screen,
                    {
                        paddingTop: insets.top,
                        justifyContent: "center",
                        alignItems: "center",
                    },
                ]}
            >
                <Text style={styles(theme).title}>Monthly Report</Text>
                <Text
                    style={{
                        fontSize: 15,
                        color: theme.colors.textSecondary,
                        textAlign: "center",
                        paddingHorizontal: 32,
                        marginTop: 16,
                        fontFamily: theme.fonts.body.family,
                    }}
                >
                    Sign in to view your monthly cycle report and insights.
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles(theme).screen, { paddingTop: insets.top }]}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background}
            />

            {/* Header */}
            <View style={styles(theme).header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles(theme).headerBtn}
                >
                    <FontAwesome
                        name="chevron-left"
                        size={16}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Red Petal</Text>
                <TouchableOpacity style={styles(theme).headerBtn}>
                    <FontAwesome
                        name="share-alt"
                        size={18}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                    />
                    <Text
                        style={{
                            marginTop: 16,
                            color: theme.colors.textSecondary,
                            fontFamily: theme.fonts.body.family,
                        }}
                    >
                        Loading report...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles(theme).scrollContent}
                >
                    {/* Title */}
                    <Animated.View
                        entering={FadeInDown.duration(500)}
                        style={styles(theme).titleSection}
                    >
                        <Text style={styles(theme).title}>
                            Your Monthly Reflection
                        </Text>
                        <View style={styles(theme).monthNav}>
                            <TouchableOpacity
                                onPress={() => navigateMonth(-1)}
                                style={styles(theme).monthNavBtn}
                            >
                                <FontAwesome
                                    name="chevron-left"
                                    size={12}
                                    color={theme.colors.primary}
                                />
                            </TouchableOpacity>
                            <View style={styles(theme).monthChip}>
                                <FontAwesome
                                    name="calendar"
                                    size={12}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles(theme).monthText}>
                                    {monthName}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigateMonth(1)}
                                style={styles(theme).monthNavBtn}
                            >
                                <FontAwesome
                                    name="chevron-right"
                                    size={12}
                                    color={theme.colors.primary}
                                />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Summary Cards */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(500)}
                        style={styles(theme).summaryGrid}
                    >
                        <View style={styles(theme).summaryCard}>
                            <Text style={styles(theme).summaryLabel}>
                                CYCLE LENGTH
                            </Text>
                            <Text style={styles(theme).summaryValue}>
                                {cycleLength}
                            </Text>
                        </View>
                        <View style={styles(theme).summaryCard}>
                            <Text style={styles(theme).summaryLabel}>
                                AVG. FLOW
                            </Text>
                            <Text style={styles(theme).summaryValue}>
                                {avgFlow}
                            </Text>
                        </View>
                        <View
                            style={[
                                styles(theme).summaryCard,
                                styles(theme).summaryCardFull,
                            ]}
                        >
                            <View>
                                <Text style={styles(theme).summaryLabel}>
                                    PERIOD DURATION
                                </Text>
                                <Text style={styles(theme).summaryValue}>
                                    {periodDuration}
                                </Text>
                            </View>
                            <FontAwesome
                                name="tint"
                                size={32}
                                color={theme.colors.primary + "40"}
                            />
                        </View>
                    </Animated.View>

                    {/* Logged Days Summary */}
                    {report && report.totalLogDays > 0 && (
                        <Animated.View
                            entering={FadeInDown.delay(150).duration(500)}
                            style={styles(theme).loggedDaysCard}
                        >
                            <FontAwesome
                                name="check-circle"
                                size={18}
                                color={theme.colors.primary}
                            />
                            <Text style={styles(theme).loggedDaysText}>
                                You logged {report.totalLogDays} days this month
                            </Text>
                        </Animated.View>
                    )}

                    {/* Energy Chart */}
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(500)}
                        style={styles(theme).chartSection}
                    >
                        <View style={styles(theme).chartHeader}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <FontAwesome
                                    name="bolt"
                                    size={16}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles(theme).chartTitle}>
                                    Energy Levels
                                </Text>
                            </View>
                            <Text style={styles(theme).chartSubtitle}>
                                {monthName}
                            </Text>
                        </View>
                        <EnergyChart
                            theme={theme}
                            dailyLogs={report?.dailyLogs || []}
                        />
                    </Animated.View>

                    {/* Symptom Frequency */}
                    <Animated.View
                        entering={FadeInDown.delay(300).duration(500)}
                        style={styles(theme).chartSection}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 20,
                            }}
                        >
                            <FontAwesome
                                name="bar-chart"
                                size={16}
                                color={theme.colors.primary}
                            />
                            <Text style={styles(theme).chartTitle}>
                                Symptom Frequency
                            </Text>
                        </View>
                        {symptomBars.length > 0 ? (
                            symptomBars.map((s) => (
                                <SymptomBar
                                    key={s.type}
                                    label={
                                        s.type.charAt(0).toUpperCase() +
                                        s.type.slice(1)
                                    }
                                    count={s.count}
                                    maxCount={maxSymptomCount}
                                />
                            ))
                        ) : (
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: theme.colors.textMuted,
                                    textAlign: "center",
                                    paddingVertical: 16,
                                    fontFamily: theme.fonts.body.family,
                                }}
                            >
                                No symptoms logged this month
                            </Text>
                        )}
                    </Animated.View>

                    {/* Mood Distribution */}
                    {report?.moods && report.moods.length > 0 && (
                        <Animated.View
                            entering={FadeInDown.delay(350).duration(500)}
                            style={styles(theme).chartSection}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 20,
                                }}
                            >
                                <FontAwesome
                                    name="smile-o"
                                    size={16}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles(theme).chartTitle}>
                                    Mood Distribution
                                </Text>
                            </View>
                            {report.moods.map((m) => (
                                <SymptomBar
                                    key={m.mood}
                                    label={
                                        m.mood.charAt(0).toUpperCase() +
                                        m.mood.slice(1)
                                    }
                                    count={m.count}
                                    maxCount={Math.max(
                                        ...report.moods.map((x) => x.count)
                                    )}
                                />
                            ))}
                        </Animated.View>
                    )}

                    {/* Share CTA */}
                    <Animated.View
                        entering={FadeInDown.delay(400).duration(500)}
                    >
                        <TouchableOpacity
                            style={styles(theme).shareBtn}
                            activeOpacity={0.8}
                        >
                            <FontAwesome
                                name="medkit"
                                size={18}
                                color="#FFF"
                            />
                            <Text style={styles(theme).shareBtnText}>
                                Share Report with Doctor
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Bottom spacer */}
                    <View style={{ height: 120 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = (theme: AppTheme) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primary + "15",
        },
        headerBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
        },
        headerTitle: {
            fontSize: 18,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            color: theme.colors.primary,
            letterSpacing: 0.5,
        },
        scrollContent: {
            paddingHorizontal: 16,
        },
        titleSection: {
            alignItems: "center",
            marginVertical: 24,
        },
        title: {
            fontSize: 26,
            fontFamily: theme.fonts.title.family,
            color: theme.colors.text,
            marginBottom: 16,
            textAlign: "center",
        },
        monthNav: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        monthNavBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.primary + "10",
            alignItems: "center",
            justifyContent: "center",
        },
        monthChip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: theme.colors.primary + "08",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.primary + "20",
        },
        monthText: {
            fontSize: 13,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            color: theme.colors.text,
        },
        summaryGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
        },
        summaryCard: {
            flex: 1,
            minWidth: "45%",
            backgroundColor: theme.colors.surface,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary + "10",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
        },
        summaryCardFull: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: "100%",
        },
        summaryLabel: {
            fontSize: 10,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            letterSpacing: 1.5,
            color: theme.colors.textMuted,
            marginBottom: 4,
            textTransform: "uppercase",
        },
        summaryValue: {
            fontSize: 22,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            color: theme.colors.primary,
        },
        loggedDaysCard: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: theme.colors.primary + "08",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 20,
        },
        loggedDaysText: {
            fontSize: 13,
            fontFamily: theme.fonts.body.family,
            fontWeight: "600",
            color: theme.colors.text,
        },
        chartSection: {
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary + "10",
            marginBottom: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
        },
        chartHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        chartTitle: {
            fontSize: 16,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            color: theme.colors.text,
        },
        chartSubtitle: {
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            color: theme.colors.textMuted,
        },
        shareBtn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: theme.colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
            marginBottom: 16,
        },
        shareBtnText: {
            color: "#FFFFFF",
            fontSize: 15,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
        },
    });
