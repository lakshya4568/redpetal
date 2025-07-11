import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const { theme } = useThemeContext();
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
      onClose();
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: "90%",
      maxHeight: "80%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    closeButtonText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
    },
    textInput: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      minHeight: 120,
      textAlignVertical: "top",
      marginBottom: theme.spacing.lg,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.md,
    },
    button: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      ...theme.typography.button,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
    },
    submitButtonText: {
      color: theme.colors.textOnPrimary,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Post</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Share your thoughts with the community..."
            placeholderTextColor={theme.colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={!content.trim()}
            >
              <Text style={[styles.buttonText, styles.submitButtonText]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
