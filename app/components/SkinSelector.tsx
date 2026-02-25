/**
 * SkinSelector — Skin condition toggle grid
 * Matches the Stitch Daily Log "Skin" section
 */

import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

export type SkinType = "clear" | "oily" | "dry" | "breakouts";

interface SkinSelectorProps {
    selected: SkinType[];
    onToggle: (skin: SkinType) => void;
}

const SKIN_OPTIONS: { skin: SkinType; label: string }[] = [
    { skin: "clear", label: "Clear" },
    { skin: "oily", label: "Oily" },
    { skin: "dry", label: "Dry" },
    { skin: "breakouts", label: "Breakouts" },
];

export default function SkinSelector({ selected, onToggle }: SkinSelectorProps) {
    const { theme } = useThemeContext();

    return (
        <View style={styles(theme).container}>
            <Text style={styles(theme).title}>SKIN</Text>
            <View style={styles(theme).grid}>
                {SKIN_OPTIONS.map((opt) => {
                    const isSelected = selected.includes(opt.skin);
                    return (
                        <TouchableOpacity
                            key={opt.skin}
                            onPress={() => onToggle(opt.skin)}
                            style={[
                                styles(theme).skinButton,
                                isSelected && styles(theme).skinButtonActive,
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles(theme).label,
                                    isSelected && styles(theme).labelActive,
                                ]}
                            >
                                {opt.label}
                            </Text>
                            <View
                                style={[
                                    styles(theme).checkbox,
                                    isSelected && styles(theme).checkboxActive,
                                ]}
                            >
                                {isSelected && (
                                    <FontAwesome name="check" size={10} color="#FFFFFF" />
                                )}
                            </View>
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
        title: {
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            letterSpacing: 2,
            color: theme.colors.textMuted,
            marginBottom: 20,
        },
        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },
        skinButton: {
            width: "47%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
        },
        skinButtonActive: {
            backgroundColor: theme.colors.primary + "08",
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        label: {
            fontSize: 14,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            color: theme.colors.text,
        },
        labelActive: {
            fontWeight: "700",
            color: theme.colors.primary,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: theme.colors.borderLight,
            alignItems: "center",
            justifyContent: "center",
        },
        checkboxActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
    });
