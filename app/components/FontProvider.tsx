import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

interface FontProviderProps {
  children: React.ReactNode;
}

const FontProvider: React.FC<FontProviderProps> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  });
  const [appReady, setAppReady] = useState(false);
  const [fontError, setFontError] = useState<null | string>(null);

  useEffect(() => {
    // Only call this on native platforms
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
      setAppReady(true);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Timeout fallback in case font loading hangs
    const timeout = setTimeout(() => {
      if (!fontsLoaded) {
        setFontError("Font loading timed out. Please restart the app.");
        SplashScreen.hideAsync().catch(() => {});
        setAppReady(true);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  if (fontError) {
    return (
      <>
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {fontError}
        </Text>
        {children}
      </>
    );
  }

  if (!appReady) {
    return null;
  }

  return <>{children}</>;
};

export { FontProvider };
export default FontProvider;
