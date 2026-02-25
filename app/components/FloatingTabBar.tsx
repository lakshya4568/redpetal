/**
 * FloatingTabBar — Redesigned to match Stitch navigation
 * 4-tab layout: Home | Cycle | Community | Me
 * With center "+" FAB for quick logging
 */

import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { AppTheme, useThemeContext } from "./ThemeContext";

interface TabItem {
  name: string;
  icon: keyof typeof FontAwesome.glyphMap;
  label: string;
}

interface FloatingTabBarProps {
  state: {
    index: number;
    routes: { name: string; key: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
}

const TABS: TabItem[] = [
  { name: "index", icon: "home", label: "Home" },
  { name: "calendar", icon: "calendar", label: "Cycle" },
  { name: "community", icon: "group", label: "Community" },
  { name: "profile", icon: "user", label: "Me" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.88;

export default function FloatingTabBar({
  state,
  navigation,
}: FloatingTabBarProps) {
  const { theme } = useThemeContext();
  const activeIndex = useSharedValue(state.index);

  React.useEffect(() => {
    // Map state index to our 4-tab display
    const displayIndex = getDisplayIndex(state.index, state.routes);
    activeIndex.value = withSpring(displayIndex, {
      damping: 18,
      stiffness: 180,
    });
  }, [state.index, activeIndex, state.routes]);

  const getDisplayIndex = (
    routeIndex: number,
    routes: { name: string }[]
  ): number => {
    const routeName = routes[routeIndex]?.name;
    return TABS.findIndex((t) => t.name === routeName);
  };

  const handleTabPress = (tabName: string) => {
    navigation.navigate(tabName);
  };

  const currentRouteName = state.routes[state.index]?.name;

  return (
    <View style={styles(theme).container}>
      <BlurView
        intensity={80}
        tint="light"
        style={styles(theme).blurContainer}
      >
        <View style={styles(theme).tabsContainer}>
          {TABS.map((tab, index) => {
            const isActive = currentRouteName === tab.name;

            // Insert center FAB between Cycle and Community
            if (index === 2) {
              return (
                <React.Fragment key={tab.name}>
                  {/* Center FAB */}
                  <Pressable
                    onPress={() => router.push("/features/log")}
                    style={styles(theme).centerFab}
                  >
                    <FontAwesome name="plus" size={22} color="#FFFFFF" />
                  </Pressable>
                  {/* Tab item */}
                  <Pressable
                    onPress={() => handleTabPress(tab.name)}
                    style={styles(theme).tabItem}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={tab.label}
                  >
                    <FontAwesome
                      name={tab.icon}
                      size={22}
                      color={
                        isActive
                          ? theme.colors.primary
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles(theme).tabLabel,
                        isActive && { color: theme.colors.primary, fontWeight: "700" },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                </React.Fragment>
              );
            }

            return (
              <Pressable
                key={tab.name}
                onPress={() => handleTabPress(tab.name)}
                style={styles(theme).tabItem}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
              >
                <FontAwesome
                  name={tab.icon}
                  size={22}
                  color={
                    isActive
                      ? theme.colors.primary
                      : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles(theme).tabLabel,
                    isActive && { color: theme.colors.primary, fontWeight: "700" },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 24,
      left: (SCREEN_WIDTH - TAB_BAR_WIDTH) / 2,
      width: TAB_BAR_WIDTH,
      height: 68,
      borderRadius: 999,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    blurContainer: {
      flex: 1,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    tabsContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingHorizontal: 8,
    },
    tabItem: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 4,
      minWidth: 50,
    },
    tabLabel: {
      fontSize: 9,
      fontFamily: theme.fonts.body.family,
      fontWeight: "700",
      color: theme.colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    centerFab: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: -24,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  });
