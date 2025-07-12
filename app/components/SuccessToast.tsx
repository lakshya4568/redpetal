import React, { useEffect } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useThemeContext } from "./ThemeContext";

interface SuccessToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
}

export default function SuccessToast({
  visible,
  message,
  onHide,
}: SuccessToastProps) {
  const { theme } = useThemeContext();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, opacity, translateY, onHide]);

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: 80,
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 1000,
    },
    toast: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      ...theme.shadows.md,
    },
    message: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textOnPrimary,
      fontWeight: "600",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
}
