import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeContext } from "./ThemeContext";

const FontTest: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <View style={styles.container}>
      <Text style={[theme.typography.brand, styles.fontTest]}>
        RedPetal (Pacifico)
      </Text>

      <Text style={[theme.typography.headlineLarge, styles.fontTest]}>
        Beautiful Subtitle (Cookie)
      </Text>

      <Text style={[theme.typography.bodyLarge, styles.fontTest]}>
        This is body text using Open Sans font. It should be clean and readable
        for all your period tracking needs.
      </Text>

      <Text style={[styles.fontTest, { fontFamily: "System" }]}>
        System Font Fallback
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  fontTest: {
    textAlign: "center",
    marginVertical: 10,
  },
});

export default FontTest;
