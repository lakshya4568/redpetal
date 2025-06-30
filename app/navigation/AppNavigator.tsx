import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { useThemeContext } from "../components/ThemeContext";
import CalendarScreen from "../screens/CalendarScreen";
import CommunityScreen from "../screens/CommunityScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ResourcesScreen from "../screens/ResourcesScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme } = useThemeContext();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: theme.components.tabBar,
          tabBarActiveTintColor: theme.colors.textOnPrimary,
          tabBarInactiveTintColor: theme.colors.textOnPrimary,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Resources" component={ResourcesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}