import { router } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  Animated,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useAuth } from "../services/auth";
import { theme } from "../theme";

const BACKGROUND_IMAGE = require("../../assets/images/floral-background.png");

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // Using mock login for now
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleSignup = () => {
    login(); // In a real app, this would be a signup function
    router.replace("/(tabs)");
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>RedPetal</Text>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          <Button mode="contained" onPress={handleSignup} style={styles.button}>
            Signup
          </Button>
          <Button
            onPress={() => router.push("/auth/login")}
            style={styles.button}
          >
            Go to Login
          </Button>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
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
  },
});
