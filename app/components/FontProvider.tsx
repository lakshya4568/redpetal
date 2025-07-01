import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

// Prevent auto hide initially
SplashScreen.preventAutoHideAsync().catch(() => {
  // Silently catch errors - this is expected on web
});

interface FontProviderProps {
  children: React.ReactNode;
}

const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [appReady, setAppReady] = useState(false);

  // Define font configuration - more robust approach
  const fontConfig = useMemo((): Record<string, any> => {
    // For web, don't load custom fonts
    if (Platform.OS === "web") {
      return {};
    }

    // For native platforms, load fonts with error handling
    try {
      const config: Record<string, any> = {
        "Pacifico-Title": require("../../assets/fonts/Pacifico-Title.ttf"),
        "Cookie-subtitle": require("../../assets/fonts/Cookie-subtitle.ttf"),
        "OpenSans-Body": require("../../assets/fonts/OpenSans-Body.ttf"),
      };
      return config;
    } catch (error) {
      console.warn("Font files not found, using system fonts:", error);
      return {};
    }
  }, []);

  const [fontsLoaded, fontLoadError] = useFonts(fontConfig);

  // Handle font loading completion
  const onLayoutRootView = useCallback(async () => {
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
      setAppReady(true); // Continue anyway
    }
  }, [fontsLoaded, fontConfig]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Handle font loading errors
  useEffect(() => {
    if (fontLoadError) {
      console.error("Font loading error:", fontLoadError);
      console.log("Platform:", Platform.OS);
      console.log("Font config keys:", Object.keys(fontConfig));
      console.log("Fonts loaded:", fontsLoaded);
      setAppReady(true); // Continue with system fonts
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontLoadError, fontConfig, fontsLoaded]);

  // Timeout fallback for native platforms
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        Platform.OS !== "web" &&
        !fontsLoaded &&
        !fontLoadError &&
        Object.keys(fontConfig).length > 0
      ) {
        console.warn("Font loading timed out, continuing with system fonts");
        setAppReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 3000); // Reduced timeout to 3 seconds

    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontLoadError, fontConfig]);

  // For web, don't wait for fonts
  useEffect(() => {
    if (Platform.OS === "web") {
      setAppReady(true);
    }
  }, []);

  if (!appReady) {
    return null;
  }

  return <>{children}</>;
};

export { FontProvider };
export default FontProvider;
