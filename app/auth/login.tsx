import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "../components/ThemeContext";
import { useAuth } from "../services/auth";

const BACKGROUND_IMAGE = require("../../assets/images/floral-background.png");

// Define a type for the errors state
interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Use the defined type for the errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const { login } = useAuth();
  const { theme } = useThemeContext();
  const [fadeAnim] = useState(new Animated.Value(0));

  //validate email and password
  const validateForm = () => {
    // Initialize errors with the correct type
    let errors: FormErrors = {};

    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      console.log("Submitted", email, password);
      setEmail("");
      setPassword("");
      setErrors({}); // Clear errors on successful validation

      login();
      router.replace("/(tabs)");
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles(theme).background}
      imageStyle={{ opacity: 0.7 }} // Reduce opacity of the background image
    >
      <SafeAreaView style={styles(theme).safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles(theme).keyboardAvoidingView}
        >
          <View style={styles(theme).overlay}>
            <Text style={styles(theme).title}>RedPetal</Text>
            <Animated.View
              style={[styles(theme).formContainer, { opacity: fadeAnim }]}
            >
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles(theme).input}
                error={!!errors.email}
                theme={{ colors: { primary: theme.colors.primary } }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {/* Add error message display if needed */}
              {errors.email && (
                <Text style={styles(theme).errorText}>{errors.email}</Text>
              )}
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles(theme).input}
                error={!!errors.password}
                theme={{ colors: { primary: theme.colors.primary } }}
                autoComplete="current-password"
              />
              {/* Add error message display if needed */}
              {errors.password && (
                <Text style={styles(theme).errorText}>{errors.password}</Text>
              )}
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles(theme).button}
                contentStyle={styles(theme).buttonContent}
              >
                Login
              </Button>
              <View style={styles(theme).signupContainer}>
                <Text style={styles(theme).signupText}>
                  Don&apos;t have an account?{" "}
                </Text>
                <Button
                  onPress={() => router.push("/auth/signup")}
                  mode="text"
                  style={styles(theme).signupButton}
                >
                  Sign Up
                </Button>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "transparent", // Make SafeAreaView transparent
    },
    background: {
      flex: 1,
      resizeMode: "cover",
    },
    keyboardAvoidingView: {
      flex: 1,
      justifyContent: "center",
    },
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    formContainer: {
      width: Platform.OS === "web" ? "50%" : "100%",
      maxWidth: 400,
      alignSelf: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      ...theme.shadows.lg,
    },
    title: {
      ...theme.typography.brand,
      color: theme.colors.primary,
      textAlign: "center",
      marginBottom: theme.spacing.xxl,
    },
    input: {
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: -theme.spacing.sm,
      marginBottom: theme.spacing.md,
      marginLeft: theme.spacing.md,
    },
    button: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
    buttonContent: {
      height: 48,
    },
    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    signupText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    signupButton: {
      marginLeft: -theme.spacing.sm,
    },
  });
