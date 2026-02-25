/**
 * DailyLogScreen — Daily symptom/mood/flow/skin logging
 * Matches the Stitch "Red Petal Daily Log" design
 * Connected to POST /api/daily-logs
 */

import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { dailyLogsAPI } from "../../services/api";
import { useAuth } from "../../services/auth";
import FlowSelector, { FlowLevel } from "../components/FlowSelector";
import MoodSelector, { MoodType } from "../components/MoodSelector";
import SkinSelector, { SkinType } from "../components/SkinSelector";
import { AppTheme, useThemeContext } from "../components/ThemeContext";

export default function DailyLogScreen() {
    const { theme } = useThemeContext();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const isGuest = user?.id === "guest";

    const [flow, setFlow] = useState<FlowLevel | null>(null);
    const [mood, setMood] = useState<MoodType | null>(null);
    const [skin, setSkin] = useState<SkinType[]>([]);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSkinToggle = (s: SkinType) => {
        setSkin((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    };

    const handleSave = async () => {
        if (isGuest) {
            Alert.alert(
                "Sign in Required",
                "Please sign in to save your daily log.",
                [{ text: "OK" }]
            );
            return;
        }

        if (!flow && !mood && skin.length === 0 && !notes.trim()) {
            Alert.alert(
                "Nothing to save",
                "Please log at least one item before saving."
            );
            return;
        }

        try {
            setSaving(true);
            await dailyLogsAPI.create({
                date: new Date().toISOString().split("T")[0],
                flow: flow || null,
                mood: mood || null,
                skin: skin.length > 0 ? skin : [],
                notes: notes.trim() || null,
            });
            Alert.alert("Saved! ✨", "Your daily log has been recorded.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error("Error saving daily log:", error);
            Alert.alert(
                "Save Failed",
                error?.message || "Could not save your log. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const today = new Date();
    const dayName = today
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();
    const dateStr = today
        .toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        .toUpperCase();

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
                        color={theme.colors.text}
                    />
                </TouchableOpacity>
                <View style={styles(theme).headerCenter}>
                    <Text style={styles(theme).headerDay}>{dayName}</Text>
                    <Text style={styles(theme).headerDate}>{dateStr}</Text>
                </View>
                <TouchableOpacity style={styles(theme).headerBtn}>
                    <FontAwesome
                        name="calendar"
                        size={18}
                        color={theme.colors.text}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles(theme).scrollContent}
            >
                {/* Title */}
                <Animated.View entering={FadeInDown.duration(500)}>
                    <Text style={styles(theme).title}>
                        How are you feeling{"\n"}today?
                    </Text>
                </Animated.View>

                {/* Flow */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <FlowSelector selected={flow} onSelect={setFlow} />
                </Animated.View>

                {/* Mood */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <MoodSelector selected={mood} onSelect={setMood} />
                </Animated.View>

                {/* Skin */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <SkinSelector selected={skin} onToggle={handleSkinToggle} />
                </Animated.View>

                {/* Notes */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                    <Text style={styles(theme).notesLabel}>DAILY NOTES</Text>
                    <TextInput
                        style={styles(theme).notesInput}
                        placeholder="How's your energy? Any specific cravings?"
                        placeholderTextColor={theme.colors.textMuted}
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />
                </Animated.View>

                {/* Bottom spacer */}
                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Sticky Save Button */}
            <View
                style={[
                    styles(theme).saveButtonContainer,
                    { paddingBottom: insets.bottom + 90 },
                ]}
            >
                <TouchableOpacity
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles(theme).saveButton,
                            saving && { opacity: 0.7 },
                        ]}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles(theme).saveButtonText}>
                                    Save Daily Log
                                </Text>
                                <FontAwesome
                                    name="heart"
                                    size={16}
                                    color="#FFF"
                                />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
            paddingHorizontal: 24,
            paddingVertical: 12,
        },
        headerBtn: {
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
        },
        headerCenter: {
            alignItems: "center",
        },
        headerDay: {
            fontSize: 9,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            letterSpacing: 3,
            color: theme.colors.primary,
            marginBottom: 2,
        },
        headerDate: {
            fontSize: 13,
            fontFamily: theme.fonts.body.family,
            fontWeight: "600",
            color: theme.colors.text,
            letterSpacing: 1,
        },
        scrollContent: {
            paddingHorizontal: 24,
        },
        title: {
            fontSize: 32,
            fontFamily: theme.fonts.subtitle.family,
            color: theme.colors.text,
            lineHeight: 40,
            marginBottom: 32,
            marginTop: 16,
        },
        notesLabel: {
            fontSize: 11,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
            letterSpacing: 2,
            color: theme.colors.textMuted,
            marginBottom: 12,
        },
        notesInput: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 16,
            fontSize: 14,
            fontFamily: theme.fonts.body.family,
            color: theme.colors.text,
            minHeight: 96,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
        },
        saveButtonContainer: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            paddingTop: 12,
        },
        saveButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 40,
            paddingVertical: 16,
            borderRadius: 999,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
        },
        saveButtonText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontFamily: theme.fonts.body.family,
            fontWeight: "700",
        },
    });
