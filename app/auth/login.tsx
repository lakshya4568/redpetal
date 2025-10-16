import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useThemeContext } from "../components/ThemeContext";
import { useAuth } from "../services/auth";

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Please check your credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    titleContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.xxxl,
    },
    title: {
      ...theme.typography.brand,
      color: theme.colors.primary,
      fontSize: 48,
      textAlign: "center",
    },
    subtitle: {
      ...theme.typography.headlineSmall,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: theme.spacing.md,
    },
    form: {
      marginBottom: theme.spacing.xl,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.labelLarge,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      ...theme.components.input,
      fontSize: 16,
      minHeight: 50,
    },
    inputFocused: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    loginButton: {
      ...theme.components.button.primary,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      marginTop: theme.spacing.lg,
    },
    loginButtonDisabled: {
      backgroundColor: theme.colors.textMuted,
    },
    loginButtonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
      fontWeight: "600",
    },
    registerContainer: {
      alignItems: "center",
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
    },
    registerText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    registerLink: {
      ...theme.typography.bodyMedium,
      color: theme.colors.primary,
      fontWeight: "600",
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>RedPetal</Text>
            <Text style={styles.subtitle}>
              Your personal period companion
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don&apos;t have an account?
            </Text>
            <Link href="/auth/signup" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.registerLink}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}