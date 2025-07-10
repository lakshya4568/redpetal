import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

interface ArticleCardProps {
  title: string;
  items?: string[];
  image: any;
  onPress?: () => void;
  height?: number;
}

export default function ArticleCard({
  title,
  items,
  image,
  onPress,
  height = 200,
}: ArticleCardProps) {
  const { theme } = useThemeContext();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles(theme).container, { height }]}
    >
      <ImageBackground
        source={image}
        style={styles(theme).image}
        imageStyle={{ borderRadius: theme.borderRadius.lg }}
      >
        <View style={styles(theme).overlay}>
          <Text style={styles(theme).title}>{title}</Text>
          {items && (
            <View style={styles(theme).itemsContainer}>
              {items.map((item, index) => (
                <Text key={index} style={styles(theme).item}>
                  {item}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    } as ViewStyle,
    image: {
      width: "100%",
      height: "100%",
      justifyContent: "flex-end",
    } as ViewStyle,
    overlay: {
      backgroundColor: "rgba(0,0,0,0.3)",
      padding: theme.spacing.lg,
      borderBottomLeftRadius: theme.borderRadius.lg,
      borderBottomRightRadius: theme.borderRadius.lg,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: "white",
      fontWeight: "bold",
    } as TextStyle,
    itemsContainer: {
      marginTop: theme.spacing.sm,
    },
    item: {
      ...theme.typography.bodyLarge,
      color: "white",
      marginBottom: theme.spacing.xs,
    } as TextStyle,
  });
