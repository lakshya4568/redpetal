/**
 * SymptomBar — Horizontal progress bar for symptom frequency
 * Used in Monthly Report screen
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface SymptomBarProps {
    label: string;
    count: number;
    maxCount: number;
}

export default function SymptomBar({ label, count, maxCount }: SymptomBarProps) {
    const { theme } = useThemeContext();
    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

    return (
        <View style={styles(theme).container}>
            <View style={styles(theme).labelRow}>
                <Text style={styles(theme).label}>{label}</Text>
                <Text style={styles(theme).count}>{count} days</Text>
            </View>
            <View style={styles(theme).trackBar}>
                <View
                    style={[styles(theme).fillBar, { width: `${percentage}%` }]}
                />
            </View>
        </View>
    );
}

const styles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginBottom: 16,
        },
        labelRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
        },
        label: {
            fontSize: 14,
            fontFamily: theme.fonts.body.family,
            color: theme.colors.text,
        },
        count: {
            fontSize: 14,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            color: theme.colors.text,
        },
        trackBar: {
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.primary + "15",
            overflow: "hidden",
        },
        fillBar: {
            height: "100%",
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
        },
    });
