import { FontAwesome } from "@expo/vector-icons";
import { TabBar } from "@mindinventory/react-native-tab-bar-interaction";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Dimensions } from "react-native";
import { useAuth } from "../services/auth";
import { theme } from "../theme";

import CalendarScreen from "../screens/CalendarScreen";
import CommunityScreen from "../screens/CommunityScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ResourcesScreen from "../screens/ResourcesScreen";
import SignupScreen from "../screens/SignupScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  {
    name: "Home",
    activeIcon: (
      <FontAwesome name="home" color={theme.colors.white} size={25} />
    ),
    inactiveIcon: (
      <FontAwesome name="home" color={theme.colors.text} size={25} />
    ),
  },
  {
    name: "Calendar",
    activeIcon: (
      <FontAwesome name="calendar" color={theme.colors.white} size={25} />
    ),
    inactiveIcon: (
      <FontAwesome name="calendar" color={theme.colors.text} size={25} />
    ),
  },
  {
    name: "Community",
    activeIcon: (
      <FontAwesome name="users" color={theme.colors.white} size={25} />
    ),
    inactiveIcon: (
      <FontAwesome name="users" color={theme.colors.text} size={25} />
    ),
  },
  {
    name: "Resources",
    activeIcon: (
      <FontAwesome name="book" color={theme.colors.white} size={25} />
    ),
    inactiveIcon: (
      <FontAwesome name="book" color={theme.colors.text} size={25} />
    ),
  },
  {
    name: "Profile",
    activeIcon: (
      <FontAwesome name="user" color={theme.colors.white} size={25} />
    ),
    inactiveIcon: (
      <FontAwesome name="user" color={theme.colors.text} size={25} />
    ),
  },
];

function AppTabs() {
  const windowWidth = Dimensions.get("window").width;

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <TabBar
          tabs={TABS}
          containerWidth={windowWidth}
          tabBarContainerBackground={theme.colors.primary}
          circleFillColor={theme.colors.accent}
          onTabChange={(tab: any, index: number) => {
            props.navigation.navigate(tab.name);
          }}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
