import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeContext } from "./ThemeContext";

export type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
};

export type Post = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
};

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
}) => {
  const { theme } = useThemeContext();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const styles = getStyles(theme);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike(post.id);
  };

  const handleShare = () => {
    Alert.alert("Share Post", "Choose how to share this post", [
      { text: "Copy Link", onPress: () => onShare(post.id) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {isLiked ? "❤️" : "🤍"} {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(post.id)}
        >
          <Text style={styles.actionText}>💬 {post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.md,
    },
    userInfo: {
      flex: 1,
    },
    author: {
      ...theme.typography.titleMedium,
      color: theme.colors.text,
      fontWeight: "bold",
    },
    timestamp: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    content: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-around",
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.md,
    },
    actionButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      minWidth: 80,
      alignItems: "center",
    },
    actionText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
    likedText: {
      color: theme.colors.primary,
    },
  });

export default PostCard;
