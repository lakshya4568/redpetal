import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useThemeContext } from "../components/ThemeContext";
import PostCard, { Post } from "../components/PostCard";

export default function CommunityScreen() {
  const { theme } = useThemeContext();

  // Placeholder data for posts
  const posts: Post[] = [
    {
      id: "1",
      author: "Alice",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      content: "Feeling great today! Remember to stay hydrated.",
      likes: 15,
      comments: 3,
    },
    {
      id: "2",
      author: "Bob",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      content: "Just tried a new healthy recipe. So delicious!",
      likes: 22,
      comments: 7,
    },
    {
      id: "3",
      author: "Charlie",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      content: "Any tips for managing period cramps naturally?",
      likes: 10,
      comments: 5,
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      ...theme.typography.headlineLarge,
      color: theme.colors.text,
    },
    newPostButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.xxl,
    },
    newPostButtonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
    },
    postList: {
      padding: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity style={styles.newPostButton}>
          <Text style={styles.newPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />
    </View>
  );
}
