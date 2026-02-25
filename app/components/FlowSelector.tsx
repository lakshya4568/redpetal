/**
 * FlowSelector — Period flow intensity selector
 * Matches the Stitch Daily Log "Flow" section
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

export type FlowLevel = "spotting" | "light" | "medium" | "heavy";

interface FlowSelectorProps {
    selected: FlowLevel | null;
    onSelect: (level: FlowLevel) => void;
}

const FLOW_OPTIONS: { level: FlowLevel; label: string; icon: string; size: number }[] = [
    { level: "spotting", label: "Spotting", icon: "water-opacity", size: 20 },
    { level: "light", label: "Light", icon: "water-outline", size: 22 },
    { level: "medium", label: "Medium", icon: "water", size: 24 },
    { level: "heavy", label: "Heavy", icon: "water-plus", size: 28 },
];

export default function FlowSelector({ selected, onSelect }: FlowSelectorProps) {
    const { theme } = useThemeContext();

    return (
        <View style={styles(theme).container}>
            <View style={styles(theme).header}>
                <Text style={styles(theme).title}>FLOW</Text>
                <Text style={styles(theme).hint}>Clear intensity</Text>
            </View>
            <View style={styles(theme).optionsRow}>
                {FLOW_OPTIONS.map((opt) => {
                    const isSelected = selected === opt.level;
                    return (
                        <TouchableOpacity
                            key={opt.level}
                            onPress={() => onSelect(opt.level)}
                            style={styles(theme).optionWrapper}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles(theme).iconCircle,
                                    isSelected && styles(theme).iconCircleActive,
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={opt.icon as any}
                                    size={opt.size}
                                    color={theme.colors.primary}
                                />
                            </View>
                            <Text
                                style={[
                                    styles(theme).label,
                                    isSelected && styles(theme).labelActive,
                                ]}
                            >
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginBottom: 32,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        title: {
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            letterSpacing: 2,
            color: theme.colors.textMuted,
        },
        hint: {
            fontSize: 10,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            color: theme.colors.primary,
        },
        optionsRow: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        optionWrapper: {
            alignItems: "center",
            gap: 10,
        },
        iconCircle: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.overlay,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "transparent",
        },
        iconCircleActive: {
            backgroundColor: theme.colors.primary + "20",
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        label: {
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            color: theme.colors.textSecondary,
        },
        labelActive: {
            fontWeight: "700",
            color: theme.colors.primary,
        },
    });
