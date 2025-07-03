import { FontAwesome } from "@expo/vector-icons";
import {
  TabBar,
  TabsType,
} from "@mindinventory/react-native-tab-bar-interaction";
import { Tabs } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { useThemeContext } from "../components/ThemeContext";

export default function TabLayout() {
  const { theme } = useThemeContext();
  const windowWidth = Dimensions.get("window").width;

  const TABS = [
    {
      name: "index",
      activeIcon: (
        <FontAwesome name="home" color={theme.colors.textOnPrimary} size={25} />
      ),
      inactiveIcon: (
        <FontAwesome name="home" color={theme.colors.textMuted} size={25} />
      ),
    },
    {
      name: "calendar",
      activeIcon: (
        <FontAwesome
          name="calendar"
          color={theme.colors.textOnPrimary}
          size={25}
        />
      ),
      inactiveIcon: (
        <FontAwesome name="calendar" color={theme.colors.textMuted} size={25} />
      ),
    },
    {
      name: "community",
      activeIcon: (
        <FontAwesome
          name="users"
          color={theme.colors.textOnPrimary}
          size={25}
        />
      ),
      inactiveIcon: (
        <FontAwesome name="users" color={theme.colors.textMuted} size={25} />
      ),
    },
    {
      name: "resources",
      activeIcon: (
        <FontAwesome name="book" color={theme.colors.textOnPrimary} size={25} />
      ),
      inactiveIcon: (
        <FontAwesome name="book" color={theme.colors.textMuted} size={25} />
      ),
    },
    {
      name: "profile",
      activeIcon: (
        <FontAwesome name="user" color={theme.colors.textOnPrimary} size={25} />
      ),
      inactiveIcon: (
        <FontAwesome name="user" color={theme.colors.textMuted} size={25} />
      ),
    },
  ];

  return (
    <Tabs
      tabBar={(props) => (
        <TabBar
          tabs={TABS}
          containerWidth={windowWidth * 0.9}
          tabBarContainerBackground={theme.colors.primary}
          circleFillColor={theme.colors.accent}
          containerBottomSpace={theme.spacing.lg}
          containerTopLeftRadius={theme.borderRadius.none}
          containerTopRightRadius={theme.borderRadius.none}
          containerBottomLeftRadius={theme.borderRadius.xl}
          containerBottomRightRadius={theme.borderRadius.xl}
          transitionSpeed={theme.animation.slow}
          defaultActiveTabIndex={0}
          onTabChange={(tab: TabsType, index: number) => {
            // Use immediate navigation instead of setTimeout to prevent race conditions
            try {
              props.navigation.navigate(tab.name);
            } catch (error) {
              console.warn("Navigation error:", error);
            }
          }}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="resources" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
