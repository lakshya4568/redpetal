/**
 * TrendingCircle — Community trending circle icon
 * Matches the Stitch community screen design
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface TrendingCircleProps {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
    onPress?: () => void;
}

export default function TrendingCircle({
    label,
    icon,
    color,
    bgColor,
    onPress,
}: TrendingCircleProps) {
    const { theme } = useThemeContext();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles(theme).container}
            activeOpacity={0.7}
        >
            <View style={[styles(theme).outerCircle, { borderColor: bgColor }]}>
                <View style={[styles(theme).innerCircle, { backgroundColor: bgColor }]}>
                    <Text style={[styles(theme).icon, { color }]}>{icon}</Text>
                </View>
            </View>
            <Text style={styles(theme).label} numberOfLines={2}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            alignItems: "center",
            width: 72,
            gap: 8,
        },
        outerCircle: {
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
        },
        innerCircle: {
            width: "100%",
            height: "100%",
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
        },
        icon: {
            fontSize: 24,
        },
        label: {
            fontSize: 10,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            textAlign: "center",
            color: theme.colors.text,
            lineHeight: 14,
        },
    });
