/**
 * PetalTracker — Signature organic blob cycle tracker
 * Matches the Stitch "Modern Home" design with gradient petal shape
 */

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface PetalTrackerProps {
    cycleDay: number;
    phase: string;
    fertilityLevel: string;
}

export default function PetalTracker({
    cycleDay,
    phase,
    fertilityLevel,
}: PetalTrackerProps) {
    const { theme } = useThemeContext();

    return (
        <View style={styles(theme).container}>
            {/* Background glow */}
            <View style={styles(theme).backgroundGlow} />

            {/* Main petal shape */}
            <View style={styles(theme).petalWrapper}>
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles(theme).petalShape}
                >
                    <View style={styles(theme).textContent}>
                        <Text style={styles(theme).cycleLabel}>CYCLE DAY</Text>
                        <Text style={styles(theme).cycleDayNumber}>{cycleDay}</Text>
                        <View style={styles(theme).phaseBadge}>
                            <Text style={styles(theme).phaseText}>{phase}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Fertility badge */}
            <View style={styles(theme).fertilityBadge}>
                <Text style={styles(theme).fertilityLabel}>FERTILE</Text>
                <Text style={styles(theme).fertilityLevel}>{fertilityLevel}</Text>
            </View>
        </View>
    );
}

const styles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            alignItems: "center",
            justifyContent: "center",
            height: 320,
            position: "relative",
        },
        backgroundGlow: {
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: theme.colors.primary,
            opacity: 0.06,
        },
        petalWrapper: {
            width: 260,
            height: 260,
            position: "relative",
        },
        petalShape: {
            width: "100%",
            height: "100%",
            borderTopLeftRadius: 80,
            borderTopRightRadius: 160,
            borderBottomRightRadius: 160,
            borderBottomLeftRadius: 80,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.3,
            shadowRadius: 24,
            elevation: 12,
        },
        textContent: {
            alignItems: "center",
        },
        cycleLabel: {
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            letterSpacing: 3,
            marginBottom: 4,
        },
        cycleDayNumber: {
            color: "#FFFFFF",
            fontSize: 56,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            marginBottom: 8,
        },
        phaseBadge: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 999,
        },
        phaseText: {
            color: "#FFFFFF",
            fontSize: 13,
            fontFamily: theme.fonts.body.family,
            fontWeight: "600",
        },
        fertilityBadge: {
            position: "absolute",
            bottom: 20,
            right: 20,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
        },
        fertilityLabel: {
            color: theme.colors.primary,
            fontSize: 9,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            letterSpacing: 1,
        },
        fertilityLevel: {
            color: theme.colors.text,
            fontSize: 20,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
        },
    });
