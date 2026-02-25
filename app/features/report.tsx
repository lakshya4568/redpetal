/**
 * MonthlyReportScreen — Monthly cycle/symptom report
 * Matches the Stitch "Red Petal Monthly Report" design
 */

import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Path, Stop, LinearGradient as SvgGrad } from "react-native-svg";
import SymptomBar from "../components/SymptomBar";
import { AppTheme, useThemeContext } from "../components/ThemeContext";

// Mock data
const SUMMARY = {
    cycleLength: "28 Days",
    avgFlow: "Medium",
    periodDuration: "5 Days",
};

const SYMPTOMS = [
    { label: "Cramps", count: 12, maxCount: 15 },
    { label: "Bloating", count: 8, maxCount: 15 },
    { label: "Headache", count: 3, maxCount: 15 },
];

function EnergyChart({ theme }: { theme: AppTheme }) {
    const width = 300;
    const height = 120;
    // Simple area chart path
    const chartPath = `M0 ${height * 0.8} L${width * 0.1} ${height * 0.7} L${width * 0.2} ${height * 0.4} L${width * 0.3} ${height * 0.2} L${width * 0.4} ${height * 0.45} L${width * 0.5} ${height * 0.6} L${width * 0.6} ${height * 0.3} L${width * 0.7} ${height * 0.1} L${width * 0.8} ${height * 0.5} L${width * 0.9} ${height * 0.85} L${width} ${height * 0.9}`;
    const areaPath = `${chartPath} L${width} ${height} L0 ${height} Z`;

    return (
        <View style={{ alignItems: "center" }}>
            <Svg width={width} height={height}>
                <Defs>
                    <SvgGrad id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.2" />
                        <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0" />
                    </SvgGrad>
                </Defs>
                <Path d={areaPath} fill="url(#areaGrad)" />
                <Path d={chartPath} fill="none" stroke={theme.colors.primary} strokeWidth="2.5" />
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
    const [selectedMonth] = useState("October 2023");

    return (
        <View style={[styles(theme).screen, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles(theme).header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles(theme).headerBtn}
                >
                    <FontAwesome name="chevron-left" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Red Petal</Text>
                <TouchableOpacity style={styles(theme).headerBtn}>
                    <FontAwesome name="share-alt" size={18} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles(theme).scrollContent}
            >
                {/* Title */}
                <Animated.View
                    entering={FadeInDown.duration(500)}
                    style={styles(theme).titleSection}
                >
                    <Text style={styles(theme).title}>Your Monthly Reflection</Text>
                    <View style={styles(theme).monthChip}>
                        <FontAwesome
                            name="calendar"
                            size={12}
                            color={theme.colors.primary}
                        />
                        <Text style={styles(theme).monthText}>{selectedMonth}</Text>
                    </View>
                </Animated.View>

                {/* Summary Cards */}
                <Animated.View
                    entering={FadeInDown.delay(100).duration(500)}
                    style={styles(theme).summaryGrid}
                >
                    <View style={styles(theme).summaryCard}>
                        <Text style={styles(theme).summaryLabel}>CYCLE LENGTH</Text>
                        <Text style={styles(theme).summaryValue}>{SUMMARY.cycleLength}</Text>
                    </View>
                    <View style={styles(theme).summaryCard}>
                        <Text style={styles(theme).summaryLabel}>AVG. FLOW</Text>
                        <Text style={styles(theme).summaryValue}>{SUMMARY.avgFlow}</Text>
                    </View>
                    <View style={[styles(theme).summaryCard, styles(theme).summaryCardFull]}>
                        <View>
                            <Text style={styles(theme).summaryLabel}>PERIOD DURATION</Text>
                            <Text style={styles(theme).summaryValue}>
                                {SUMMARY.periodDuration}
                            </Text>
                        </View>
                        <FontAwesome
                            name="tint"
                            size={32}
                            color={theme.colors.primary + "40"}
                        />
                    </View>
                </Animated.View>

                {/* Energy Chart */}
                <Animated.View
                    entering={FadeInDown.delay(200).duration(500)}
                    style={styles(theme).chartSection}
                >
                    <View style={styles(theme).chartHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <FontAwesome name="bolt" size={16} color={theme.colors.primary} />
                            <Text style={styles(theme).chartTitle}>Energy Levels</Text>
                        </View>
                        <Text style={styles(theme).chartSubtitle}>Past 30 Days</Text>
                    </View>
                    <EnergyChart theme={theme} />
                </Animated.View>

                {/* Symptom Frequency */}
                <Animated.View
                    entering={FadeInDown.delay(300).duration(500)}
                    style={styles(theme).chartSection}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
                        <FontAwesome name="bar-chart" size={16} color={theme.colors.primary} />
                        <Text style={styles(theme).chartTitle}>Symptom Frequency</Text>
                    </View>
                    {SYMPTOMS.map((s) => (
                        <SymptomBar
                            key={s.label}
                            label={s.label}
                            count={s.count}
                            maxCount={s.maxCount}
                        />
                    ))}
                </Animated.View>

                {/* Share CTA */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                    <TouchableOpacity style={styles(theme).shareBtn} activeOpacity={0.8}>
                        <FontAwesome name="medkit" size={18} color="#FFF" />
                        <Text style={styles(theme).shareBtnText}>
                            Share Report with Doctor
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles(theme).aiInsight}>
                        "Your energy peaked during Week 2, consistent with your previous
                        cycle. This is a great time for high-intensity movement."
                    </Text>
                </Animated.View>

                {/* Bottom spacer */}
                <View style={{ height: 120 }} />
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
        aiInsight: {
            fontSize: 13,
            fontFamily: theme.fonts.subtitle.family,
            color: theme.colors.textMuted,
            lineHeight: 22,
            textAlign: "center",
            paddingHorizontal: 24,
            marginBottom: 16,
        },
    });
