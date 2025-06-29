import { FontAwesome } from "@expo/vector-icons";
import {
  TabBar,
  TabsType,
} from "@mindinventory/react-native-tab-bar-interaction";
import { Tabs } from 'expo-router';
import React from "react";
import { Dimensions } from "react-native";
import { theme } from "../theme";

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
      <FontAwesome name="users" color={theme.colors.textOnPrimary} size={25} />
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

export default function TabLayout() {
  const windowWidth = Dimensions.get("window").width;

  return (
    <Tabs
      tabBar={(props) => (
        <TabBar
          tabs={TABS}
          containerWidth={windowWidth * 0.9}
          tabBarContainerBackground={theme.colors.primary}
          circleFillColor={theme.colors.accent}
          containerBottomSpace={theme.spacing.lg}
          containerTopLeftRadius={theme.borderRadius.xxl}
          containerTopRightRadius={theme.borderRadius.xxl}
          containerBottomLeftRadius={theme.borderRadius.xxl}
          containerBottomRightRadius={theme.borderRadius.xxl}
          transitionSpeed={theme.animation.normal}
          defaultActiveTabIndex={0}
          onTabChange={(tab: TabsType, index: number) => {
            setTimeout(() => {
              props.navigation.navigate(tab.name);
            }, theme.animation.fast);
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
