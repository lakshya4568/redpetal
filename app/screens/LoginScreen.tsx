import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Animated,
  ImageBackground,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useThemeContext } from "../components/ThemeContext";
import { useAuth } from "../services/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND_IMAGE = require("../../assets/images/floral-background.png");

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const { theme } = useThemeContext();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const styles = createStyles(theme);

  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
      <View style={[{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
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
            <Button mode="contained" onPress={login} style={styles.button}>
              Login
            </Button>
            <Button
              onPress={() => navigation.navigate("Signup")}
              style={styles.button}
            >
              Go to Signup
            </Button>
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
      color: theme.colors.accent, // Added text color for the button
    },
  });
