import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

export default function NotesCard() {
  const { theme } = useThemeContext();
  const [note, setNote] = React.useState("");

  return (
    <View style={styles(theme).card}>
      <Text style={styles(theme).title}>My Notes</Text>
      <TextInput
        style={styles(theme).input}
        placeholder="Add a note..."
        placeholderTextColor={theme.colors.textSecondary}
        value={note}
        onChangeText={setNote}
        multiline
      />
      <TouchableOpacity style={styles(theme).button}>
        <Text style={styles(theme).buttonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
    } as ViewStyle,
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    } as TextStyle,
    input: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 100,
      textAlignVertical: "top",
    } as TextStyle,
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.xl,
      marginTop: theme.spacing.md,
      alignSelf: "flex-end",
    },
    buttonText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.background,
      fontWeight: "bold",
    },
  });
