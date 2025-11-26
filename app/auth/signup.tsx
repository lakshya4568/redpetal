import { Link, router } from "expo-router";
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
import { useAuth } from "../../services/auth";
import { useThemeContext } from "../components/ThemeContext";

export default function SignupScreen() {
  const { theme } = useThemeContext();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!formData.email || !formData.username || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Please try again");
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
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.brand,
      color: theme.colors.primary,
      fontSize: 40,
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
    required: {
      color: theme.colors.error,
    },
    input: {
      ...theme.components.input,
      fontSize: 16,
      minHeight: 50,
    },
    signupButton: {
      ...theme.components.button.primary,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      marginTop: theme.spacing.lg,
    },
    signupButtonDisabled: {
      backgroundColor: theme.colors.textMuted,
    },
    signupButtonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
      fontWeight: "600",
    },
    loginContainer: {
      alignItems: "center",
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
    },
    loginText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    loginLink: {
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
            <Text style={styles.title}>Join RedPetal</Text>
            <Text style={styles.subtitle}>Start your wellness journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
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
              <Text style={styles.label}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                placeholder="Choose a username"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, first_name: text })
                }
                placeholder="Your first name"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, last_name: text })
                }
                placeholder="Your last name"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signupButton,
                isLoading && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
