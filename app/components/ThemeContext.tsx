import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";
import { colorPalettes, switchTheme } from "../theme";

// Define the shape of the context
interface ThemeContextType {
  theme: any;
  palette: keyof typeof colorPalettes;
  setPalette: (palette: keyof typeof colorPalettes) => void;
  resetPalette: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType>({
  theme: switchTheme("blushPink"),
  palette: "blushPink",
  setPalette: () =>
    console.warn("setPalette called outside of a ThemeProvider"),
  resetPalette: () =>
    console.warn("resetPalette called outside of a ThemeProvider"),
});

// Custom hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [palette, setPalette] =
    useState<keyof typeof colorPalettes>("blushPink");

  // Load the saved theme from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedPalette = await AsyncStorage.getItem("themePalette");
        if (savedPalette) {
          setPalette(savedPalette as keyof typeof colorPalettes);
        } else {
          // If no saved theme, use system preference
          const colorScheme = Appearance.getColorScheme();
          setPalette(colorScheme === "dark" ? "roseRed" : "blushPink");
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error);
      }
    };
    loadTheme();
  }, []);

  // Save the theme to AsyncStorage whenever it changes
  const handleSetPalette = (newPalette: keyof typeof colorPalettes) => {
    setPalette(newPalette);
    AsyncStorage.setItem("themePalette", newPalette).catch((error) => {
      console.error("Failed to save theme to storage", error);
    });
  };

  // Reset to the default theme
  const handleResetPalette = () => {
    handleSetPalette("blushPink");
  };

  // Re-compute the theme only when the palette changes
  const theme = useMemo(() => switchTheme(palette), [palette]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        palette,
        setPalette: handleSetPalette,
        resetPalette: handleResetPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
