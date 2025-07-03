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
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={{ flex: 1, justifyContent: "center" }}
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
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            {/* Add error message display if needed */}
            {errors.email && (
              <Text style={{ color: "red" }}>{errors.email}</Text>
            )}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles(theme).input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            {/* Add error message display if needed */}
            {errors.password && (
              <Text style={{ color: "red" }}>{errors.password}</Text>
            )}
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles(theme).button}
            >
              Login
            </Button>
            <Button
              onPress={() => router.push("/auth/signup")}
              style={styles(theme).button}
            >
              Go to Signup
            </Button>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: "cover",
      // Add opacity to the background image using ImageBackground's imageStyle prop
    },
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      padding: theme.spacing.lg,
    },
    formContainer: {
      width: Platform.OS === "web" ? "50%" : "100%",
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
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    button: {
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.accent, // Added text color for the button
    },
  });
