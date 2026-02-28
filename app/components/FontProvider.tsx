import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

// Prevent auto hide initially
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silently catch errors - this is expected on web
});

interface FontProviderProps {
  children: React.ReactNode;
}

const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [appReady, setAppReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Define font configuration - more robust approach
  const fontConfig = useMemo((): Record<string, any> => {
    // For web, don't load custom fonts
    if (Platform.OS === "web") {
      return {};
    }

    // For native platforms, load fonts with error handling
    try {
      const config: Record<string, any> = {
        "PlayfairDisplay": require("../../assets/fonts/PlayfairDisplay-Bold.ttf"),
        "PlayfairDisplay-Italic": require("../../assets/fonts/PlayfairDisplay-Italic.ttf"),
        "PlusJakartaSans": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
      };

      // Try loading additional weight variants if available
      const optionalFonts: Record<string, string> = {
        "PlusJakartaSans-Medium": "PlusJakartaSans-Medium.ttf",
        "PlusJakartaSans-SemiBold": "PlusJakartaSans-SemiBold.ttf",
        "PlusJakartaSans-Bold": "PlusJakartaSans-Bold.ttf",
      };

      // Note: optional fonts are tried but won't break if missing
      for (const [name, _file] of Object.entries(optionalFonts)) {
        try {
          // Attempt load — wrapped in try since these may not exist yet
          if (name === "PlusJakartaSans-Medium") {
            config[name] = require("../../assets/fonts/PlusJakartaSans-Medium.ttf");
          } else if (name === "PlusJakartaSans-SemiBold") {
            config[name] = require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf");
          } else if (name === "PlusJakartaSans-Bold") {
            config[name] = require("../../assets/fonts/PlusJakartaSans-Bold.ttf");
          }
        } catch {
          // Optional font not available — that's fine
        }
      }

      return config;
    } catch (error) {
      console.warn("Font files not found, using system fonts:", error);
      return {};
    }
  }, []);

  const [fontsLoaded, fontLoadError] = useFonts(fontConfig);

  // Handle font loading completion
  const onLayoutRootView = useCallback(async () => {
    if (!isMounted) return;

    try {
      if (
        Platform.OS === "web" ||
        fontsLoaded ||
        Object.keys(fontConfig).length === 0
      ) {
        console.log("Fonts loaded successfully:", {
          platform: Platform.OS,
          fontsLoaded,
          fontConfigLength: Object.keys(fontConfig).length,
        });
        // Hide splash screen
        await SplashScreen.hideAsync();
        setAppReady(true);
      }
    } catch (error) {
      console.warn("Error hiding splash screen:", error);
      if (isMounted) {
        setAppReady(true); // Continue anyway
      }
    }
  }, [fontsLoaded, fontConfig, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      onLayoutRootView();
    }
  }, [onLayoutRootView, isMounted]);

  // Handle font loading errors
  useEffect(() => {
    if (fontLoadError && isMounted) {
      console.error("Font loading error:", fontLoadError);
      console.log("Platform:", Platform.OS);
      console.log("Font config keys:", Object.keys(fontConfig));
      console.log("Fonts loaded:", fontsLoaded);
      setAppReady(true); // Continue with system fonts
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontLoadError, fontConfig, fontsLoaded, isMounted]);

  // Timeout fallback for native platforms
  useEffect(() => {
    if (!isMounted) return;

    const timeout = setTimeout(() => {
      if (
        Platform.OS !== "web" &&
        !fontsLoaded &&
        !fontLoadError &&
        Object.keys(fontConfig).length > 0 &&
        isMounted
      ) {
        console.warn("Font loading timed out, continuing with system fonts");
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => { });
      }
    }, 3000); // Reduced timeout to 3 seconds

    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontLoadError, fontConfig, isMounted]);

  // For web, don't wait for fonts
  useEffect(() => {
    if (Platform.OS === "web" && isMounted) {
      setAppReady(true);
    }
  }, [isMounted]);

  if (!appReady || !isMounted) {
    // Show a loading indicator instead of blank screen
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFF5F5",
        }}
      >
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return <>{children}</>;
};

export { FontProvider };
export default FontProvider;
