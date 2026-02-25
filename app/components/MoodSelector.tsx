/**
 * MoodSelector — Mood selection grid
 * Matches the Stitch Daily Log "Mood" section
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

export type MoodType = "happy" | "sensitive" | "anxious" | "calm";

interface MoodSelectorProps {
    selected: MoodType | null;
    onSelect: (mood: MoodType) => void;
}

const MOOD_OPTIONS: { mood: MoodType; label: string; emoji: string }[] = [
    { mood: "happy", label: "Happy", emoji: "😊" },
    { mood: "sensitive", label: "Sensitive", emoji: "✨" },
    { mood: "anxious", label: "Anxious", emoji: "😰" },
    { mood: "calm", label: "Calm", emoji: "☁️" },
];

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
    const { theme } = useThemeContext();

    return (
        <View style={styles(theme).container}>
            <View style={styles(theme).header}>
                <Text style={styles(theme).title}>MOOD</Text>
            </View>
            <View style={styles(theme).grid}>
                {MOOD_OPTIONS.map((opt) => {
                    const isSelected = selected === opt.mood;
                    return (
                        <TouchableOpacity
                            key={opt.mood}
                            onPress={() => onSelect(opt.mood)}
                            style={[
                                styles(theme).moodButton,
                                isSelected && styles(theme).moodButtonActive,
                            ]}
                            activeOpacity={0.7}
                        >
                            <Text style={styles(theme).emoji}>{opt.emoji}</Text>
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
        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
        },
        moodButton: {
            width: "47%",
            alignItems: "center",
            gap: 10,
            paddingVertical: 16,
            borderRadius: 16,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
        },
        moodButtonActive: {
            backgroundColor: theme.colors.primary + "15",
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        emoji: {
            fontSize: 28,
        },
        label: {
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            fontWeight: "500",
            color: theme.colors.text,
        },
        labelActive: {
            fontWeight: "700",
            color: theme.colors.primary,
        },
    });
