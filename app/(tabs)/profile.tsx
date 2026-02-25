/**
 * ProfileScreen - Redesigned for RedPetal V2
 * User profile with settings cards and smooth animations
 */

import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../../services/auth";
import { AppTheme, useThemeContext } from "../components/ThemeContext";
import { responsive, springConfigs, timingConfigs } from "../utils/animations";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingsItemProps {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  theme: AppTheme;
  index: number;
  showBorder?: boolean;
  iconColor?: string;
}

// Memoized Settings Item
const SettingsItem = React.memo(
  ({
    icon,
    title,
    subtitle,
    onPress,
    theme,
    index,
    showBorder = true,
    iconColor,
  }: SettingsItemProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-20);

    useEffect(() => {
      const delay = 200 + index * 60;
      opacity.value = withDelay(delay, withTiming(1, timingConfigs.normal));
      translateX.value = withDelay(delay, withSpring(0, springConfigs.gentle));
    }, [index, opacity, translateX]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, springConfigs.snappy);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, springConfigs.snappy);
    }, [scale]);

    return (
      <AnimatedPressable
        style={[
          styles(theme).settingsItem,
          showBorder && styles(theme).settingsItemBorder,
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles(theme).settingsIconContainer,
            iconColor && { backgroundColor: iconColor + "20" },
          ]}
        >
          <FontAwesome
            name={icon}
            size={responsive.sp(18)}
            color={iconColor || theme.colors.primary}
          />
        </View>
        <View style={styles(theme).settingsTextContainer}>
          <Text style={styles(theme).settingsTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles(theme).settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
        <FontAwesome
          name="chevron-right"
          size={responsive.sp(14)}
          color={theme.colors.textMuted}
        />
      </AnimatedPressable>
    );
  }
);

SettingsItem.displayName = "SettingsItem";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useThemeContext();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);
  const avatarScale = useSharedValue(0.8);

  // Animate on mount
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 400 });
    headerScale.value = withSpring(1, springConfigs.gentle);
    avatarScale.value = withDelay(150, withSpring(1, springConfigs.bouncy));
  }, [headerOpacity, headerScale, avatarScale]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/auth/login");
  }, [logout]);

  const handleThemePress = useCallback(() => {
    router.push("/components/ThemeScreen");
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <ScrollView
      style={styles(theme).container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles(theme).scrollContent}
    >
      {/* Header with Avatar */}
      <Animated.View style={[styles(theme).header, headerAnimatedStyle]}>
        <Animated.View
          style={[styles(theme).avatarContainer, avatarAnimatedStyle]}
        >
          <View style={styles(theme).avatar}>
            <FontAwesome
              name="user"
              size={responsive.sp(40)}
              color={theme.colors.textOnPrimary}
            />
          </View>
          <View style={styles(theme).editBadge}>
            <FontAwesome
              name="pencil"
              size={responsive.sp(10)}
              color={theme.colors.textOnPrimary}
            />
          </View>
        </Animated.View>
        <Text style={styles(theme).userName}>{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || "RedPetal User"}</Text>
        <Text style={styles(theme).userEmail}>{user?.email || "user@redpetal.app"}</Text>
      </Animated.View>

      {/* Account Section */}
      <View style={styles(theme).section}>
        <Text style={styles(theme).sectionTitle}>Account</Text>
        <View style={styles(theme).sectionCard}>
          <SettingsItem
            icon="user"
            title="Personal Information"
            subtitle="Manage your profile details"
            onPress={() => { }}
            theme={theme}
            index={0}
          />
          <SettingsItem
            icon="lock"
            title="Privacy & Security"
            subtitle="Password and data settings"
            onPress={() => { }}
            theme={theme}
            index={1}
          />
          <SettingsItem
            icon="bell"
            title="Notifications"
            subtitle="Reminders and alerts"
            onPress={() => { }}
            theme={theme}
            index={2}
            showBorder={false}
          />
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles(theme).section}>
        <Text style={styles(theme).sectionTitle}>Preferences</Text>
        <View style={styles(theme).sectionCard}>
          <SettingsItem
            icon="paint-brush"
            title="Appearance"
            subtitle="Theme and display settings"
            onPress={handleThemePress}
            theme={theme}
            index={3}
            iconColor={theme.colors.accent}
          />
          <SettingsItem
            icon="globe"
            title="Language"
            subtitle="English"
            onPress={() => { }}
            theme={theme}
            index={4}
            iconColor={theme.colors.info}
          />
          <SettingsItem
            icon="calendar"
            title="Cycle Settings"
            subtitle="Customize your tracking"
            onPress={() => { }}
            theme={theme}
            index={5}
            showBorder={false}
            iconColor={theme.colors.success}
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles(theme).section}>
        <Text style={styles(theme).sectionTitle}>Support</Text>
        <View style={styles(theme).sectionCard}>
          <SettingsItem
            icon="question-circle"
            title="Help Center"
            onPress={() => { }}
            theme={theme}
            index={6}
          />
          <SettingsItem
            icon="envelope"
            title="Contact Us"
            onPress={() => { }}
            theme={theme}
            index={7}
          />
          <SettingsItem
            icon="info-circle"
            title="About RedPetal"
            subtitle="Version 2.0.0"
            onPress={() => { }}
            theme={theme}
            index={8}
            showBorder={false}
          />
        </View>
      </View>

      {/* Logout Button */}
      <Pressable
        style={({ pressed }) => [
          styles(theme).logoutButton,
          pressed && styles(theme).logoutButtonPressed,
        ]}
        onPress={handleLogout}
      >
        <FontAwesome
          name="sign-out"
          size={responsive.sp(18)}
          color={theme.colors.error}
        />
        <Text style={styles(theme).logoutText}>Log Out</Text>
      </Pressable>

      {/* Bottom spacer */}
      <View style={styles(theme).bottomSpacer} />
    </ScrollView>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: responsive.sp(20),
    },
    header: {
      alignItems: "center",
      paddingTop:
        Platform.OS === "android" ? responsive.sp(60) : responsive.sp(70),
      paddingBottom: responsive.sp(24),
      backgroundColor: theme.colors.surface,
      borderBottomLeftRadius: responsive.sp(32),
      borderBottomRightRadius: responsive.sp(32),
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    avatarContainer: {
      position: "relative",
      marginBottom: responsive.sp(16),
    },
    avatar: {
      width: responsive.sp(90),
      height: responsive.sp(90),
      borderRadius: responsive.sp(45),
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: responsive.sp(28),
      height: responsive.sp(28),
      borderRadius: responsive.sp(14),
      backgroundColor: theme.colors.accent,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: theme.colors.surface,
    },
    userName: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(22),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: responsive.sp(4),
    },
    userEmail: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(14),
      color: theme.colors.textSecondary,
    },
    section: {
      marginTop: responsive.sp(24),
      paddingHorizontal: responsive.sp(20),
    },
    sectionTitle: {
      fontFamily: theme.fonts.subtitle.family,
      fontSize: responsive.fs(14),
      fontWeight: "600",
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: responsive.sp(12),
      marginLeft: responsive.sp(4),
    },
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: responsive.sp(20),
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    settingsItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: responsive.sp(16),
      paddingHorizontal: responsive.sp(16),
    },
    settingsItemBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.borderLight,
    },
    settingsIconContainer: {
      width: responsive.sp(40),
      height: responsive.sp(40),
      borderRadius: responsive.sp(12),
      backgroundColor: theme.colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginRight: responsive.sp(14),
    },
    settingsTextContainer: {
      flex: 1,
    },
    settingsTitle: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(15),
      fontWeight: "600",
      color: theme.colors.text,
    },
    settingsSubtitle: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(12),
      color: theme.colors.textMuted,
      marginTop: responsive.sp(2),
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: responsive.sp(32),
      marginHorizontal: responsive.sp(20),
      paddingVertical: responsive.sp(16),
      backgroundColor: theme.colors.error + "10",
      borderRadius: responsive.sp(16),
      borderWidth: 1,
      borderColor: theme.colors.error + "30",
    },
    logoutButtonPressed: {
      backgroundColor: theme.colors.error + "20",
    },
    logoutText: {
      fontFamily: theme.fonts.body.family,
      fontSize: responsive.fs(16),
      fontWeight: "600",
      color: theme.colors.error,
      marginLeft: responsive.sp(10),
    },
    bottomSpacer: {
      height: responsive.sp(100),
    },
  });
