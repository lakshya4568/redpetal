
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useThemeContext } from './ThemeContext';

export type Post = {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
};

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { theme } = useThemeContext();
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <Text style={styles.author}>{post.author}</Text>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{post.likes} Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>{post.comments} Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
  },
  author: {
    ...theme.typography.titleMedium,
    color: theme.colors.text,
  },
  content: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  button: {
    padding: theme.spacing.xs,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});

export default PostCard;
