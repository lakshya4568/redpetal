import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "../components/ThemeContext";
import { useAuth } from "../services/auth";

const BACKGROUND_IMAGE = require("../../assets/images/floral-background.png");

// Define a type for the form errors
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const { login } = useAuth(); // Using mock login for now
  const { theme } = useThemeContext();
  const [fadeAnim] = useState(new Animated.Value(0));

  // Validate form fields
  const validateForm = () => {
    let newErrors: FormErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (validateForm()) {
      console.log("Signup successful", {
        firstName,
        lastName,
        email,
        password,
      });
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});

      login(); // In a real app, this would be a signup function
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
    <ImageBackground source={BACKGROUND_IMAGE} style={styles(theme).background}>
      <SafeAreaView style={styles(theme).safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles(theme).keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles(theme).scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles(theme).overlay}>
              <Text style={styles(theme).title}>Join RedPetal</Text>
              <Text style={styles(theme).subtitle}>
                Create your account to start tracking
              </Text>
              <Animated.View
                style={[styles(theme).formContainer, { opacity: fadeAnim }]}
              >
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles(theme).input}
                  error={!!errors.firstName}
                  theme={{ colors: { primary: theme.colors.primary } }}
                  autoCapitalize="words"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <Text style={styles(theme).errorText}>
                    {errors.firstName}
                  </Text>
                )}

                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles(theme).input}
                  error={!!errors.lastName}
                  theme={{ colors: { primary: theme.colors.primary } }}
                  autoCapitalize="words"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <Text style={styles(theme).errorText}>{errors.lastName}</Text>
                )}

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
                  autoComplete="new-password"
                />
                {errors.password && (
                  <Text style={styles(theme).errorText}>{errors.password}</Text>
                )}

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles(theme).input}
                  error={!!errors.confirmPassword}
                  theme={{ colors: { primary: theme.colors.primary } }}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <Text style={styles(theme).errorText}>
                    {errors.confirmPassword}
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSignup}
                  style={styles(theme).button}
                  contentStyle={styles(theme).buttonContent}
                >
                  Create Account
                </Button>

                <View style={styles(theme).loginContainer}>
                  <Text style={styles(theme).loginText}>
                    Already have an account?{" "}
                  </Text>
                  <Button
                    onPress={() => router.push("/auth/login")}
                    mode="text"
                    style={styles(theme).loginButton}
                  >
                    Sign In
                  </Button>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
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
    },
    scrollContainer: {
      flexGrow: 1,
      minHeight: "100%",
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
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
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
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: theme.spacing.lg,
    },
    loginText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    loginButton: {
      marginLeft: -theme.spacing.sm,
    },
  });
