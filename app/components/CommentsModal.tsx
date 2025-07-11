import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Comment } from "./PostCard";
import { useThemeContext } from "./ThemeContext";

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (comment: string) => void;
}

export default function CommentsModal({
  visible,
  onClose,
  comments,
  onAddComment,
}: CommentsModalProps) {
  const { theme } = useThemeContext();
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles(theme).commentItem}>
      <Text style={styles(theme).commentAuthor}>{item.author}</Text>
      <Text style={styles(theme).commentContent}>{item.content}</Text>
      <Text style={styles(theme).commentTime}>{item.timestamp}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView
        style={styles(theme).container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles(theme).header}>
          <Text style={styles(theme).title}>Comments</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles(theme).closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          style={styles(theme).commentsList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles(theme).inputContainer}>
          <TextInput
            style={styles(theme).textInput}
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={styles(theme).sendButton}
            onPress={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Text style={styles(theme).sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colors.text,
    },
    closeButton: {
      ...theme.typography.headlineSmall,
      color: theme.colors.textSecondary,
      padding: theme.spacing.sm,
    },
    commentsList: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    commentItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    commentAuthor: {
      ...theme.typography.titleSmall,
      color: theme.colors.text,
      fontWeight: "bold",
      marginBottom: theme.spacing.xs,
    },
    commentContent: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    commentTime: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    inputContainer: {
      flexDirection: "row",
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: "flex-end",
    },
    textInput: {
      flex: 1,
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginRight: theme.spacing.md,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    sendButtonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
    },
  });
