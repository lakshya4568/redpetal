import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
  { name: "calendar", icon: "calendar", label: "Calendar" },
  { name: "community", icon: "users", label: "Community" },
  { name: "remedies", icon: "leaf", label: "Remedies" },
  { name: "profile", icon: "user", label: "Profile" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.9;
const TAB_WIDTH = TAB_BAR_WIDTH / TABS.length;

export default function FloatingTabBar({
  state,
  navigation,
}: FloatingTabBarProps) {
  const { theme } = useThemeContext();
  const activeIndex = useSharedValue(state.index);

  // Update animation when tab changes
  React.useEffect(() => {
    activeIndex.value = withSpring(state.index, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.index, activeIndex]);

  // Animated indicator style
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeIndex.value * TAB_WIDTH }],
    };
  });

  const handleTabPress = (tabName: string, index: number) => {
    if (state.index !== index) {
      navigation.navigate(tabName);
    }
  };

  return (
    <View style={styles(theme).container}>
      <BlurView
        intensity={theme.glass.light.intensity}
        tint={theme.glass.light.tint}
        style={styles(theme).blurContainer}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles(theme).gradientOverlay}
        >
          {/* Active Tab Indicator */}
          <Animated.View style={[styles(theme).indicator, indicatorStyle]}>
            <View style={styles(theme).indicatorInner} />
          </Animated.View>

          {/* Tab Items */}
          <View style={styles(theme).tabsContainer}>
            {TABS.map((tab, index) => {
              const isActive = state.index === index;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => handleTabPress(tab.name, index)}
                  style={styles(theme).tabItem}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={tab.label}
                >
                  <FontAwesome
                    name={tab.icon}
                    size={24}
                    color={
                      isActive
                        ? theme.colors.textOnPrimary
                        : theme.colors.textOnPrimary + "80"
                    }
                  />
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: theme.spacing.lg,
      left: (SCREEN_WIDTH - TAB_BAR_WIDTH) / 2,
      width: TAB_BAR_WIDTH,
      height: 70,
      borderRadius: theme.borderRadius.xxl,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    blurContainer: {
      flex: 1,
      borderRadius: theme.borderRadius.xxl,
      overflow: "hidden",
    },
    gradientOverlay: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingHorizontal: theme.spacing.sm,
    },
    tabsContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      paddingVertical: theme.spacing.md,
    },
    indicator: {
      position: "absolute",
      width: TAB_WIDTH,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    indicatorInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.accent,
      opacity: 0.3,
    },
  });
