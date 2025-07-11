import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CommentsModal from "../components/CommentsModal";
import CreatePostModal from "../components/CreatePostModal";
import PostCard, { Comment, Post } from "../components/PostCard";
import { useThemeContext } from "../components/ThemeContext";

export default function CommunityScreen() {
  const { theme } = useThemeContext();
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Mock data with enhanced structure
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "Alice Johnson",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      content:
        "Feeling great today! Remember to stay hydrated during your cycle. Water helps so much with bloating and cramps. 💧✨",
      likes: 15,
      comments: [
        {
          id: "c1",
          author: "Sarah",
          content:
            "Thanks for the reminder! I always forget to drink enough water.",
          timestamp: "2h ago",
        },
        {
          id: "c2",
          author: "Emma",
          content:
            "So true! I noticed such a difference when I started drinking more water.",
          timestamp: "1h ago",
        },
      ],
      timestamp: "4h ago",
      isLiked: false,
    },
    {
      id: "2",
      author: "Maria Garcia",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      content:
        "Just tried a new healthy recipe for period-friendly smoothies! Spinach, banana, berries and ginger - surprisingly delicious! 🥤",
      likes: 22,
      comments: [
        {
          id: "c3",
          author: "Lisa",
          content: "Could you share the recipe? Sounds amazing!",
          timestamp: "3h ago",
        },
      ],
      timestamp: "6h ago",
      isLiked: true,
    },
    {
      id: "3",
      author: "Jennifer Smith",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      content:
        "Any tips for managing period cramps naturally? Looking for alternatives to painkillers. Heat pads help but wondering what else works for you all? 🤗",
      likes: 10,
      comments: [
        {
          id: "c4",
          author: "Anna",
          content: "Yoga and gentle stretching really help me!",
          timestamp: "2h ago",
        },
        {
          id: "c5",
          author: "Kate",
          content: "Chamomile tea and warm baths work wonders for me",
          timestamp: "1h ago",
        },
      ],
      timestamp: "8h ago",
      isLiked: false,
    },
  ]);

  const handleCreatePost = (content: string) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: "You",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      content,
      likes: 0,
      comments: [],
      timestamp: "now",
      isLiked: false,
    };
    setPosts([newPost, ...posts]);
    Alert.alert("Success", "Your post has been shared with the community!");
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (postId: string) => {
    setSelectedPostId(postId);
    setCommentsVisible(true);
  };

  const handleShare = (postId: string) => {
    Alert.alert("Shared!", "Post link copied to clipboard");
  };

  const handleAddComment = (comment: string) => {
    if (selectedPostId) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: "You",
        content: comment,
        timestamp: "now",
      };

      setPosts(
        posts.map((post) =>
          post.id === selectedPostId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
    }
  };

  const selectedPost = posts.find((post) => post.id === selectedPostId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
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
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
    },
    newPostButtonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
      fontWeight: "bold",
    },
    postList: {
      padding: theme.spacing.lg,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setCreatePostVisible(true)}
        >
          <Text style={styles.newPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
      />

      <CreatePostModal
        visible={createPostVisible}
        onClose={() => setCreatePostVisible(false)}
        onSubmit={handleCreatePost}
      />

      <CommentsModal
        visible={commentsVisible}
        onClose={() => {
          setCommentsVisible(false);
          setSelectedPostId(null);
        }}
        comments={selectedPost?.comments || []}
        onAddComment={handleAddComment}
      />
    </View>
  );
}
