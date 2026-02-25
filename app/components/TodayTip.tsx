/**
 * TodayTip — Today's health/wellness tip card
 * Matches the Stitch home dashboard "Today's Tip" section
 */

import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface TodayTipProps {
    title: string;
    onPress?: () => void;
}

export default function TodayTip({ title, onPress }: TodayTipProps) {
    const { theme } = useThemeContext();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles(theme).container}
            activeOpacity={0.8}
        >
            <View style={styles(theme).content}>
                <View style={{ flex: 1 }}>
                    <Text style={styles(theme).label}>TODAY'S TIP</Text>
                    <Text style={styles(theme).title}>{title}</Text>
                    <View style={styles(theme).readMore}>
                        <Text style={styles(theme).readMoreText}>Read more</Text>
                        <FontAwesome
                            name="arrow-right"
                            size={10}
                            color={theme.colors.textMuted}
                        />
                    </View>
                </View>
                <View style={styles(theme).iconContainer}>
                    <FontAwesome name="book" size={28} color={theme.colors.primary} />
                </View>
            </View>
            {/* Decorative blob */}
            <View style={styles(theme).decorBlob} />
        </TouchableOpacity>
    );
}

const styles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.primary + "08",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.primary + "15",
            overflow: "hidden",
            position: "relative",
        },
        content: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            zIndex: 2,
        },
        label: {
            fontSize: 10,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            color: theme.colors.primary,
            letterSpacing: 2,
            marginBottom: 8,
        },
        title: {
            fontSize: 15,
            fontFamily: theme.fonts.body.family,
            fontWeight: "600",
            color: theme.colors.text,
            lineHeight: 22,
            marginBottom: 12,
        },
        readMore: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
        },
        readMoreText: {
            fontSize: 12,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            color: theme.colors.textMuted,
        },
        iconContainer: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary + "15",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 12,
        },
        decorBlob: {
            position: "absolute",
            bottom: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary + "05",
            zIndex: 1,
        },
    });
