import { Tabs } from "expo-router";
import React from "react";
import FloatingTabBar from "../components/FloatingTabBar";
import { useThemeContext } from "../components/ThemeContext";

export default function TabLayout() {
  const { theme } = useThemeContext();

  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar state={props.state} navigation={props.navigation} />
      )}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide default tab bar
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen
        name="remedies"
        options={{ href: null }} // Hide from tab bar but keep accessible
      />
    </Tabs>
  );
}

